import { describe, expect, it } from "vitest";
import { parseCSV, mapHeaders, normalizeGender } from "./import-utils";

describe("import-utils parseCSV", () => {
  it("parses simple CSV rows", () => {
    const csv = "Name,Gender,Phone\nBudi,MALE,+6281\nSiti,FEMALE,+6282";
    expect(parseCSV(csv)).toEqual([
      ["Name", "Gender", "Phone"],
      ["Budi", "MALE", "+6281"],
      ["Siti", "FEMALE", "+6282"],
    ]);
  });

  it("handles carriage returns", () => {
    const csv = "Name,Gender\r\nBudi,MALE\r\nSiti,FEMALE";
    expect(parseCSV(csv)).toEqual([
      ["Name", "Gender"],
      ["Budi", "MALE"],
      ["Siti", "FEMALE"],
    ]);
  });

  it("handles double quoted strings with commas", () => {
    const csv = 'Name,Notes\n"Santoso, Budi","Kamar VIP, alergi kacang"';
    expect(parseCSV(csv)).toEqual([
      ["Name", "Notes"],
      ["Santoso, Budi", "Kamar VIP, alergi kacang"],
    ]);
  });

  it("handles empty lines", () => {
    const csv = "Name,Gender\n\nBudi,MALE\n  \nSiti,FEMALE\n\n";
    expect(parseCSV(csv)).toEqual([
      ["Name", "Gender"],
      ["Budi", "MALE"],
      ["Siti", "FEMALE"],
    ]);
  });
});

describe("import-utils mapHeaders", () => {
  it("maps English and Indonesian headers case-insensitively", () => {
    const headers1 = ["Nama Lengkap", "Jenis Kelamin", "Telepon", "Email", "Nomor Identitas", "Catatan"];
    expect(mapHeaders(headers1)).toEqual({
      fullName: 0,
      gender: 1,
      phone: 2,
      email: 3,
      idNumber: 4,
      notes: 5,
    });

    const headers2 = ["name", "GENDER", "Phone No", "email", "ID_NUMBER", "Notes"];
    expect(mapHeaders(headers2)).toEqual({
      fullName: 0,
      gender: 1,
      phone: 2,
      email: 3,
      idNumber: 4,
      notes: 5,
    });
  });
});

describe("import-utils normalizeGender", () => {
  it("normalizes standard male values", () => {
    expect(normalizeGender("MALE")).toBe("MALE");
    expect(normalizeGender("laki-laki")).toBe("MALE");
    expect(normalizeGender("lakilaki")).toBe("MALE");
    expect(normalizeGender("l")).toBe("MALE");
    expect(normalizeGender("m")).toBe("MALE");
  });

  it("normalizes standard female values", () => {
    expect(normalizeGender("FEMALE")).toBe("FEMALE");
    expect(normalizeGender("perempuan")).toBe("FEMALE");
    expect(normalizeGender("p")).toBe("FEMALE");
    expect(normalizeGender("f")).toBe("FEMALE");
  });

  it("returns undefined for invalid gender values", () => {
    expect(normalizeGender("unknown")).toBeUndefined();
    expect(normalizeGender("")).toBeUndefined();
  });
});
