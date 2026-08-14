export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentValue);
      currentValue = "";
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentValue);
      if (row.some(val => val.trim() !== "")) {
        lines.push(row);
      }
      row = [];
      currentValue = "";
    } else {
      currentValue += char;
    }
  }
  if (currentValue || row.length > 0) {
    row.push(currentValue);
    if (row.some(val => val.trim() !== "")) {
      lines.push(row);
    }
  }
  return lines;
}

export function normalizeGender(val: string): "MALE" | "FEMALE" | undefined {
  const norm = val.toLowerCase().trim();
  if (
    norm === "male" ||
    norm === "laki-laki" ||
    norm === "lakilaki" ||
    norm === "l" ||
    norm === "m"
  ) {
    return "MALE";
  }
  if (
    norm === "female" ||
    norm === "perempuan" ||
    norm === "p" ||
    norm === "f"
  ) {
    return "FEMALE";
  }
  return undefined;
}

export function mapHeaders(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

  headers.forEach((h, index) => {
    const norm = normalize(h);
    if (norm === "nama" || norm === "namalengkap" || norm === "name" || norm === "fullname") {
      map.fullName = index;
    } else if (norm === "jeniskelamin" || norm === "gender" || norm === "kelamin" || norm === "lp") {
      map.gender = index;
    } else if (norm === "telepon" || norm === "phone" || norm === "nohp" || norm === "telp" || norm === "phoneno" || norm === "phonenumber") {
      map.phone = index;
    } else if (norm === "email" || norm === "surel") {
      map.email = index;
    } else if (norm === "identitas" || norm === "noidentitas" || norm === "nomoridentitas" || norm === "idnumber" || norm === "ktp" || norm === "paspor") {
      map.idNumber = index;
    } else if (norm === "catatan" || norm === "notes" || norm === "keterangan") {
      map.notes = index;
    }
  });

  return map;
}
