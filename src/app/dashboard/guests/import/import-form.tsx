"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { parseCSV, mapHeaders, normalizeGender } from "@/modules/guests/import-utils";
import { guestInputSchema, type GuestInput } from "@/modules/guests/validation";
import {
  checkGuestDuplicatesAction,
  importGuestsAction,
  type DuplicateCheckResult,
} from "./actions";
import styles from "./import.module.css";

type ParsedRow = {
  rowNumber: number;
  fullName: string;
  gender: string;
  phone: string;
  email: string;
  idNumber: string;
  notes: string;
  status: "valid" | "duplicate" | "invalid";
  errors: string[];
  duplicateReason?: string;
  validatedData?: GuestInput;
};

const fieldLabels: Record<string, string> = {
  fullName: "Nama Lengkap",
  gender: "Jenis Kelamin",
  phone: "Telepon",
  email: "Email",
  idNumber: "Nomor Identitas",
  notes: "Catatan",
};

export function ImportForm() {
  const [csvText, setCsvText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isValidating, setIsValidating] = useState(false);

  const [summary, setSummary] = useState({
    total: 0,
    valid: 0,
    duplicate: 0,
    invalid: 0,
  });

  const handleDownloadTemplate = () => {
    const headers =
      "Nama Lengkap,Jenis Kelamin,Telepon,Email,Nomor Identitas,Catatan\n" +
      "Budi Santoso,Laki-laki,+628123456789,budi@example.com,1234567890123456,Tamu VIP\n" +
      "Siti Aminah,Perempuan,+628987654321,siti@example.com,3210987654321098,Alergi kacang";
    const blob = new Blob(["\uFEFF" + headers], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "templat_impor_tamu.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg("");
    }
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setParsedRows(null);

    const rawContent = csvText.trim();

    if (file) {
      setIsValidating(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        await validateContent(text);
      };
      reader.onerror = () => {
        setErrorMsg("Gagal membaca file CSV.");
        setIsValidating(false);
      };
      reader.readAsText(file);
    } else if (rawContent) {
      setIsValidating(true);
      await validateContent(rawContent);
    } else {
      setErrorMsg("Silakan pilih file CSV atau tempel data CSV terlebih dahulu.");
    }
  };

  const validateContent = async (text: string) => {
    try {
      const allLines = parseCSV(text);
      if (allLines.length < 2) {
        setErrorMsg("Format CSV tidak valid. Harus memiliki baris header dan minimal satu baris data.");
        setIsValidating(false);
        return;
      }

      const headers = allLines[0];
      if (!headers) {
        setErrorMsg("Format CSV tidak valid. Tidak ada baris header.");
        setIsValidating(false);
        return;
      }
      const headerMap = mapHeaders(headers);

      // Check required headers
      const missingHeaders = [];
      if (headerMap.fullName === undefined) missingHeaders.push("Nama Lengkap");
      if (headerMap.gender === undefined) missingHeaders.push("Jenis Kelamin");
      if (headerMap.phone === undefined) missingHeaders.push("Telepon");
      if (headerMap.idNumber === undefined) missingHeaders.push("Nomor Identitas");

      if (missingHeaders.length > 0) {
        setErrorMsg(
          `Kolom header wajib berikut tidak ditemukan: ${missingHeaders.join(", ")}. Silakan unduh templat untuk referensi.`
        );
        setIsValidating(false);
        return;
      }

      const rawRows = allLines.slice(1);
      const candidates: ParsedRow[] = [];

      // Maps to track self-duplicates inside this file upload
      const seenIdNumbers = new Set<string>();
      const seenNamePhones = new Set<string>();

      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row) continue;
        const rowNumber = i + 2; // 1-based, plus 1 for header offset

        // Pad row array to match headers length
        const getVal = (idx: number | undefined) => {
          if (idx === undefined) return "";
          return (row[idx] ?? "").trim();
        };

        const fullName = getVal(headerMap.fullName);
        const rawGender = getVal(headerMap.gender);
        const phone = getVal(headerMap.phone);
        const email = getVal(headerMap.email);
        const idNumber = getVal(headerMap.idNumber);
        const notes = getVal(headerMap.notes);

        const mappedGender = normalizeGender(rawGender);

        const rowErrors: string[] = [];
        if (!mappedGender) {
          rowErrors.push("Jenis Kelamin: Harus 'Laki-laki', 'Perempuan', 'MALE', atau 'FEMALE'.");
        }

        const candidateInput = {
          fullName,
          gender: mappedGender as GuestInput["gender"],
          phone,
          email: email || undefined,
          idNumber,
          notes: notes || undefined,
        };

        // Zod validation
        const parsed = guestInputSchema.safeParse(candidateInput);
        if (!parsed.success) {
          parsed.error.issues.forEach((err) => {
            const field = fieldLabels[err.path[0] as string] || String(err.path[0]);
            rowErrors.push(`${field}: ${err.message}`);
          });
        }

        let status: "valid" | "duplicate" | "invalid" = rowErrors.length > 0 ? "invalid" : "valid";
        let duplicateReason = undefined;

        // If schema-valid, check for self-duplicates within the CSV
        if (status === "valid") {
          const idLower = idNumber.toLowerCase();
          const namePhoneKey = `${fullName.toLowerCase()}_${phone}`;

          if (seenIdNumbers.has(idLower)) {
            status = "duplicate";
            duplicateReason = "Duplikat di dalam file (nomor identitas ganda)";
          } else if (seenNamePhones.has(namePhoneKey)) {
            status = "duplicate";
            duplicateReason = "Duplikat di dalam file (kombinasi nama & telepon ganda)";
          } else {
            seenIdNumbers.add(idLower);
            seenNamePhones.add(namePhoneKey);
          }
        }

        candidates.push({
          rowNumber,
          fullName,
          gender: rawGender,
          phone,
          email,
          idNumber,
          notes,
          status,
          errors: rowErrors,
          duplicateReason,
          validatedData: status === "valid" ? (parsed.data as GuestInput) : undefined,
        });
      }

      // Check database duplicates for all candidates that are currently "valid"
      const validCandidates = candidates.filter((c) => c.status === "valid");

      if (validCandidates.length > 0) {
        const dbDuplicates: DuplicateCheckResult[] = await checkGuestDuplicatesAction(
          validCandidates.map((c) => ({
            fullName: c.fullName,
            phone: c.phone,
            idNumber: c.idNumber,
          }))
        );

        // Map duplicates back to candidate rows
        dbDuplicates.forEach((dup) => {
          const match = candidates.find(
            (c) =>
              c.status === "valid" &&
              (c.idNumber.toLowerCase() === dup.idNumber.toLowerCase() ||
                (c.fullName.toLowerCase() === dup.fullName.toLowerCase() &&
                  c.phone === dup.phone))
          );
          if (match) {
            match.status = "duplicate";
            match.duplicateReason = `Sudah ada di database (${dup.fullName})`;
            match.validatedData = undefined;
          }
        });
      }

      // Summarize
      const total = candidates.length;
      const valid = candidates.filter((c) => c.status === "valid").length;
      const duplicate = candidates.filter((c) => c.status === "duplicate").length;
      const invalid = candidates.filter((c) => c.status === "invalid").length;

      setSummary({ total, valid, duplicate, invalid });
      setParsedRows(candidates);
    } catch (e) {
      console.error(e);
      setErrorMsg("Gagal memproses file. Pastikan data berformat CSV yang valid.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = () => {
    if (!parsedRows) return;
    setErrorMsg("");

    const validGuests = parsedRows
      .filter((r) => r.status === "valid" && r.validatedData)
      .map((r) => r.validatedData!);

    if (validGuests.length === 0) {
      setErrorMsg("Tidak ada tamu baru yang valid untuk diimpor.");
      return;
    }

    startTransition(async () => {
      const res = await importGuestsAction(validGuests);
      if (res.status === "error") {
        setErrorMsg(res.message ?? "Gagal mengimpor tamu.");
      }
    });
  };

  return (
    <div className={styles.page}>
      <Link href="/dashboard/guests" className={styles.backLink}>
        <ArrowLeft size={16} /> Kembali ke daftar tamu
      </Link>

      <header className={styles.pageHeader}>
        <div>
          <h1>Impor Tamu Massal</h1>
          <p>
            Unggah atau tempel daftar tamu dalam format CSV / Excel untuk memasukkan banyak data sekaligus.
          </p>
        </div>
      </header>

      {errorMsg && (
        <div className={styles.errorAlert} role="alert">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: UPLOAD FORM */}
      {!parsedRows && (
        <form onSubmit={handlePreview} className={styles.card}>
          <h2>Sumber Data</h2>
          <p className={styles.cardSubHeader}>
            Pilih file Excel yang disimpan sebagai format .csv, atau tempel baris CSV secara langsung.
          </p>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Pilih file CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isValidating}
              />
              <em>Pastikan file berformat pemisah koma (.csv)</em>
            </label>

            <label className={styles.field}>
              <span>Atau tempel teks CSV</span>
              <textarea
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  if (e.target.value && file) setFile(null); // Clear file if text entered
                }}
                placeholder="Nama Lengkap,Jenis Kelamin,Telepon,Email,Nomor Identitas,Catatan&#10;Budi Santoso,Laki-laki,+628123456789,budi@example.com,1234567890123456,Catatan..."
                disabled={isValidating}
              />
            </label>
          </div>

          <div className={styles.templateSection}>
            <div className={styles.templateHeader}>
              <span className={styles.templateTitle}>Format Kolom Templat (Excel-Compatible)</span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className={styles.downloadLink}
              >
                <Download size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
                Unduh templat CSV
              </button>
            </div>
            <code className={styles.templateCode}>
              Nama Lengkap,Jenis Kelamin,Telepon,Email,Nomor Identitas,Catatan
            </code>
          </div>

          <div className={styles.buttonRow}>
            <span />
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Memvalidasi…
                </>
              ) : (
                "Pratinjau & Validasi"
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: PREVIEW PANEL */}
      {parsedRows && (
        <>
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardValue}>{summary.total}</div>
              <div className={styles.summaryCardLabel}>Total Baris</div>
            </div>
            <div className={styles.summaryCard}>
              <div
                className={styles.summaryCardValue}
                style={{ color: "var(--color-checked-in)" }}
              >
                {summary.valid}
              </div>
              <div className={styles.summaryCardLabel}>Siap Diimpor</div>
            </div>
            <div className={styles.summaryCard}>
              <div
                className={styles.summaryCardValue}
                style={{ color: "var(--color-dirty)" }}
              >
                {summary.duplicate}
              </div>
              <div className={styles.summaryCardLabel}>Duplikat (Lewati)</div>
            </div>
            <div className={styles.summaryCard}>
              <div
                className={styles.summaryCardValue}
                style={{ color: "var(--color-maintenance)" }}
              >
                {summary.invalid}
              </div>
              <div className={styles.summaryCardLabel}>Tidak Valid (Lewati)</div>
            </div>
          </div>

          <div className={styles.card}>
            <h2>Hasil Pratinjau</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Baris</th>
                    <th>Nama Lengkap</th>
                    <th>Jenis Kelamin</th>
                    <th>Telepon</th>
                    <th>Email</th>
                    <th>No. Identitas</th>
                    <th>Status</th>
                    <th>Detail Masalah</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        row.status === "invalid"
                          ? styles.errorRow
                          : row.status === "duplicate"
                          ? styles.duplicateRow
                          : undefined
                      }
                    >
                      <td>{row.rowNumber}</td>
                      <td>
                        <strong>{row.fullName || "—"}</strong>
                      </td>
                      <td>{row.gender || "—"}</td>
                      <td>{row.phone || "—"}</td>
                      <td>{row.email || "—"}</td>
                      <td>{row.idNumber || "—"}</td>
                      <td>
                        {row.status === "valid" && (
                          <span className={`${styles.badge} ${styles.badgeValid}`}>
                            <CheckCircle size={12} style={{ marginRight: 4 }} /> Baru
                          </span>
                        )}
                        {row.status === "duplicate" && (
                          <span className={`${styles.badge} ${styles.badgeDuplicate}`}>
                            <AlertTriangle size={12} style={{ marginRight: 4 }} /> Duplikat
                          </span>
                        )}
                        {row.status === "invalid" && (
                          <span className={`${styles.badge} ${styles.badgeInvalid}`}>
                            <XCircle size={12} style={{ marginRight: 4 }} /> Error
                          </span>
                        )}
                      </td>
                      <td>
                        {row.duplicateReason && (
                          <span className={styles.errorText} style={{ color: "var(--color-dirty)" }}>
                            {row.duplicateReason}
                          </span>
                        )}
                        {row.errors.map((err, i) => (
                          <span key={i} className={styles.errorText}>
                            {err}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setParsedRows(null)}
                disabled={isPending}
              >
                Kembali
              </button>

              <div className={styles.buttonGroup}>
                {summary.valid > 0 ? (
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handleImport}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Mengimpor…
                      </>
                    ) : (
                      `Impor ${summary.valid} Tamu`
                    )}
                  </button>
                ) : (
                  <button type="button" className={styles.primaryButton} disabled>
                    Tidak Ada Tamu untuk Diimpor
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
