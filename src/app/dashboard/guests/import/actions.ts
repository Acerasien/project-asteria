"use server";

import { and, eq, inArray, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { guests } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { guestInputSchema, type GuestInput } from "@/modules/guests/validation";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { parseCSV } from "@/modules/guests/import-utils";

const execFileAsync = promisify(execFile);

export type DuplicateCheckResult = {
  id: string;
  fullName: string;
  idNumber: string;
  phone: string;
};

export async function checkGuestDuplicatesAction(
  candidates: Array<{ fullName: string; phone: string; idNumber: string }>
): Promise<DuplicateCheckResult[]> {
  await verifySession("guests:manage");

  if (candidates.length === 0) return [];

  // Batch check: collect all ID numbers (lower case) and name/phone conditions
  const idNumbersLower = candidates
    .map((c) => c.idNumber.trim().toLowerCase())
    .filter(Boolean);

  const namePhoneConditions = candidates.map((c) =>
    and(
      sql`lower(${guests.fullName}) = lower(${c.fullName.trim()})`,
      eq(guests.phone, c.phone.trim())
    )
  );

  const conditions = [];
  if (idNumbersLower.length > 0) {
    conditions.push(inArray(sql`lower(${guests.idNumber})`, idNumbersLower));
  }
  if (namePhoneConditions.length > 0) {
    conditions.push(...namePhoneConditions);
  }

  if (conditions.length === 0) return [];

  const matches = await db
    .select({
      id: guests.id,
      fullName: guests.fullName,
      idNumber: guests.idNumber,
      phone: guests.phone,
    })
    .from(guests)
    .where(or(...conditions));

  return matches;
}

export async function importGuestsAction(
  validGuestsList: GuestInput[]
): Promise<{ status: "success" | "error"; message?: string; count?: number }> {
  await verifySession("guests:manage");

  if (validGuestsList.length === 0) {
    return { status: "error", message: "Tidak ada tamu yang valid untuk diimpor." };
  }

  // Validate each one server-side to guarantee integrity
  for (const item of validGuestsList) {
    const parsed = guestInputSchema.safeParse(item);
    if (!parsed.success) {
      return {
        status: "error",
        message: `Data tidak valid untuk tamu ${item.fullName}: ${parsed.error.issues[0]?.message}`,
      };
    }
  }

  let count = 0;
  try {
    await db.transaction(async (tx) => {
      // Direct bulk insert
      const results = await tx
        .insert(guests)
        .values(
          validGuestsList.map((g) => {
            const parsed = guestInputSchema.parse(g);
            return {
              fullName: parsed.fullName,
              gender: parsed.gender,
              phone: parsed.phone,
              email: parsed.email,
              idNumber: parsed.idNumber,
              notes: parsed.notes,
            };
          })
        )
        .returning({ id: guests.id });
      count = results.length;
    });
  } catch (error) {
    console.error("Import Guests database error:", error);
    const code =
      typeof error === "object" && error && "code" in error
        ? String(error.code)
        : "";
    if (code === "23505") {
      return {
        status: "error",
        message: "Beberapa tamu yang Anda coba impor sudah terdaftar (nomor identitas atau kombinasi nama & telepon sudah ada).",
      };
    }
    return {
      status: "error",
      message: "Terjadi kesalahan database saat mengimpor tamu. Silakan periksa kembali data Anda.",
    };
  }

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard/reservations/new");
  redirect(`/dashboard/guests?imported=${count}`);
}

export async function parseUploadFileAction(
  formData: FormData
): Promise<{ status: "success" | "error"; rows?: string[][]; message?: string }> {
  await verifySession("guests:manage");

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { status: "error", message: "File tidak ditemukan dalam unggahan." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "csv" && ext !== "xlsx") {
    return { status: "error", message: "Format file tidak didukung. Harap unggah file .csv atau .xlsx." };
  }

  const tempPath = join(tmpdir(), `upload_${Date.now()}_${file.name}`);

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    writeFileSync(tempPath, buffer);

    let rows: string[][];

    if (ext === "xlsx") {
      const { stdout } = await execFileAsync("python", ["scripts/parse_xlsx.py", tempPath]);
      const result = JSON.parse(stdout);
      if (!result.success) {
        return { status: "error", message: `Gagal membaca Excel: ${result.error}` };
      }
      rows = result.rows;
    } else {
      // Decode CSV content using UTF-8 (handling BOM)
      let text = buffer.toString("utf-8");
      if (text.startsWith("\uFEFF")) {
        text = text.slice(1);
      }
      rows = parseCSV(text);
    }

    return { status: "success", rows };
  } catch (error) {
    console.error("File parsing error:", error);
    return { status: "error", message: "Terjadi kesalahan saat memproses file." };
  } finally {
    try {
      unlinkSync(tempPath);
    } catch {
      // ignore
    }
  }
}
