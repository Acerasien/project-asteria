# Panduan Pengguna — Sistem Operasional Hotel

Selamat datang di sistem manajemen operasional hotel. Panduan ini mencakup semua fitur yang tersedia bagi staf hotel, mulai dari membuat reservasi hingga mengatur kamar dan akun staf.

---

## Daftar Isi

1. [Masuk ke Sistem](#1-masuk-ke-sistem)
2. [Dashboard](#2-dashboard)
3. [Reservasi](#3-reservasi)
4. [Tamu](#4-tamu)
5. [Kalender](#5-kalender)
6. [Housekeeping](#6-housekeeping)
7. [Pengaturan](#7-pengaturan)
8. [Peran & Izin Akses](#8-peran--izin-akses)

---

## 1. Masuk ke Sistem

Buka aplikasi di browser Anda dan masukkan **email** dan **kata sandi** yang diberikan oleh administrator.

> **Catatan:** Jika Anda lupa kata sandi, hubungi administrator hotel untuk mendapatkan kata sandi sementara yang baru.

Setelah berhasil masuk, Anda akan diarahkan ke **Dashboard** secara otomatis.

Untuk keluar, klik avatar/nama Anda di pojok kanan atas, lalu pilih **Keluar**.

---

## 2. Dashboard

**Dashboard** adalah halaman utama yang menampilkan ringkasan operasional hotel pada hari ini.

### Kartu Statistik

Di bagian atas halaman, terdapat empat kartu ringkasan yang dapat diklik:

| Kartu | Keterangan |
|---|---|
| **Kedatangan hari ini** | Jumlah tamu yang dijadwalkan check-in hari ini |
| **Keberangkatan hari ini** | Jumlah tamu yang dijadwalkan check-out hari ini |
| **Kamar terisi** | Jumlah kamar yang sedang ditempati dari total kamar, beserta persentase okupansi |
| **Kamar yang perlu dibersihkan** | Jumlah kamar dengan status *Kotor* yang membutuhkan perhatian Housekeeping |

Klik kartu mana pun untuk langsung membuka halaman yang relevan.

### Panel Kedatangan & Keberangkatan

Di bawah kartu statistik, terdapat dua panel:

- **Kedatangan mendatang** — Daftar tamu yang akan check-in hari ini dan besok, termasuk nama, nomor kamar, tanggal check-in, dan status reservasi.
- **Keberangkatan hari ini** — Daftar tamu yang check-out hari ini beserta status kamar mereka saat ini.

Klik **Lihat semua** untuk membuka halaman Reservasi lengkap.

### Membuat Reservasi Baru dari Dashboard

Klik tombol **Reservasi baru** di pojok kanan atas halaman Dashboard untuk langsung membuka formulir reservasi baru.

---

## 3. Reservasi

Halaman **Reservasi** mengelola seluruh siklus hidup pemesanan kamar, dari konfirmasi hingga check-out.

### Melihat Daftar Reservasi

Halaman ini menampilkan semua reservasi dalam bentuk tabel. Setiap baris berisi:

- **Kode pemesanan** — Kode unik untuk setiap reservasi (contoh: `R-00042`)
- **Nama tamu**
- **Nomor kamar**
- **Masa inap** — Tanggal check-in hingga check-out
- **Status** — Badge berwarna menunjukkan status saat ini

#### Status Reservasi

| Status | Keterangan |
|---|---|
| 🟡 **Dikonfirmasi** | Reservasi telah dibuat dan dikonfirmasi, tamu belum check-in |
| 🟢 **Sudah Check-In** | Tamu sedang menginap |
| ⚪ **Sudah Check-Out** | Tamu telah meninggalkan hotel |
| 🔴 **Dibatalkan** | Reservasi telah dibatalkan |

### Mencari & Memfilter Reservasi

Gunakan kotak pencarian untuk mencari berdasarkan:

- Nama tamu
- Kode pemesanan
- Nomor kamar

Gunakan dropdown **Filter status** untuk menampilkan hanya reservasi dengan status tertentu. Klik **Terapkan filter** untuk menerapkan, atau **Bersihkan** untuk menghapus filter.

### Membuat Reservasi Baru

1. Klik tombol **+ Reservasi baru** di pojok kanan atas.
2. Isi formulir:
   - **Tamu** — Pilih tamu dari daftar. Jika tamu belum terdaftar, tambahkan terlebih dahulu di halaman Tamu.
   - **Kamar** — Pilih kamar yang tersedia.
   - **Tanggal check-in** dan **Tanggal check-out**
   - **Catatan internal** *(opsional)* — Informasi tambahan untuk staf
3. Klik **Buat reservasi** untuk menyimpan.

> **Penting:** Sistem secara otomatis memeriksa konflik ketersediaan kamar. Jika kamar sudah dipesan pada rentang tanggal tersebut, Anda akan mendapatkan pesan kesalahan.

### Melihat Detail Reservasi

Klik **Lihat** pada baris reservasi untuk membuka halaman detail. Halaman ini menampilkan:

- Detail masa inap (tanggal, kontak tamu, status kamar)
- Catatan internal (jika ada)
- Formulir edit reservasi (hanya tersedia jika status masih *Dikonfirmasi*)
- Panel **Aksi reservasi** di sisi kanan

### Aksi Reservasi (Lifecycle)

Dari panel **Aksi reservasi** di sisi kanan halaman detail, Anda dapat melakukan transisi status:

#### Check-in Tamu

Tersedia jika status **Dikonfirmasi**.

1. Klik **Check-in tamu**.
2. Jika kamar belum berstatus *Bersih*, centang opsi **Izinkan check-in jika kamar tidak bersih** terlebih dahulu.
3. Status berubah menjadi **Sudah Check-In**.

#### Check-out Tamu

Tersedia jika status **Sudah Check-In**.

1. Klik **Check-out tamu**.
2. Status berubah menjadi **Sudah Check-Out**.
3. Status kamar secara otomatis berubah menjadi *Kotor* dan perlu dibersihkan.

#### Membatalkan Reservasi

1. Klik **Batalkan reservasi**.
2. Sebuah konfirmasi akan muncul — klik **OK** untuk melanjutkan.
3. Pembatalan **tidak dapat dibatalkan**.

> **Peringatan:** Reservasi yang sudah berstatus **Sudah Check-Out** atau **Dibatalkan** tidak dapat diubah lagi.

### Mengedit Reservasi

Reservasi hanya dapat diedit selama statusnya masih **Dikonfirmasi**. Formulir edit tersedia di bagian bawah halaman detail. Setelah tamu check-in, data reservasi tidak dapat diubah lagi.

---

## 4. Tamu

Halaman **Tamu** menyimpan dan mengelola profil seluruh tamu yang pernah atau akan menginap.

### Melihat Daftar Tamu

Tabel daftar tamu menampilkan:

- Nama lengkap
- Nomor telepon
- Email
- Nomor identitas (KTP/Paspor)
- Jumlah kunjungan
- Tanggal kunjungan terakhir

### Mencari Tamu

Gunakan kotak pencarian untuk mencari berdasarkan nama lengkap, nomor telepon, email, atau nomor identitas. Klik **Cari**, lalu **Bersihkan** untuk menghapus pencarian.

### Menambah Tamu Baru

1. Klik tombol **+ Tambah tamu**.
2. Isi formulir profil tamu:
   - **Nama lengkap** *(wajib)*
   - **Nomor telepon** *(wajib)*
   - **Email** *(opsional)*
   - **Nomor identitas** — Nomor KTP atau paspor *(wajib)*
3. Klik **Simpan tamu**.

### Melihat & Mengedit Profil Tamu

Klik **Lihat** pada baris tamu untuk membuka halaman profil. Halaman ini menampilkan detail kontak tamu dan riwayat seluruh reservasi tamu tersebut, lengkap dengan tanggal dan status.

Klik **Edit profil** untuk memperbarui data kontak.

---

## 5. Kalender

Halaman **Kalender** menyediakan tampilan visual ketersediaan kamar dalam bentuk Gantt chart (garis waktu).

### Navigasi Kalender

- **← Sebelumnya / Berikutnya →** — Geser tampilan kalender ke periode sebelumnya atau berikutnya.
- **Hari ini** — Kembali ke tanggal sekarang.
- Gunakan dropdown **Tampilkan** untuk mengubah jendela waktu (misalnya 7 hari, 14 hari).

### Membaca Kalender

Setiap **baris** mewakili satu kamar. Setiap **kolom** mewakili satu hari.

Blok berwarna pada baris kamar menunjukkan reservasi yang aktif — warna blok mengikuti status reservasi, dan nama singkat tamu ditampilkan di dalam blok. Status kebersihan kamar ditampilkan sebagai badge di sebelah nomor kamar.

### Membuat Reservasi dari Kalender

Klik tombol **+ Reservasi baru** di pojok kanan atas untuk membuka formulir reservasi baru.

---

## 6. Housekeeping

Halaman **Housekeeping** membantu staf kebersihan memantau dan memperbarui status kamar per lantai.

### Tampilan Papan Housekeeping

Kamar ditampilkan dalam bentuk kartu, dikelompokkan berdasarkan **lantai**. Setiap kartu menampilkan:

- Nomor kamar dan tipe kamar
- Status kebersihan saat ini (badge berwarna)
- Status hunian — kosong atau sedang ditempati oleh tamu
- Jika ditempati: nama tamu dan kode pemesanan (dapat diklik untuk melihat detail reservasi)

### Status Kamar

| Status | Keterangan |
|---|---|
| 🟢 **Bersih** | Kamar siap untuk tamu berikutnya |
| 🟡 **Kotor** | Kamar perlu dibersihkan setelah check-out |
| 🔵 **Pemeliharaan** | Kamar sedang dalam perawatan, tidak tersedia |
| 🔴 **Rusak** | Kamar tidak dapat digunakan, perlu perbaikan |

### Memfilter Kamar

Gunakan tab navigasi di bagian atas untuk memfilter tampilan:

- **Semua kamar** — Menampilkan seluruh kamar beserta jumlah totalnya
- **Kotor** — Hanya menampilkan kamar yang perlu dibersihkan
- **Pemeliharaan** — Hanya menampilkan kamar dalam perawatan
- **Rusak** — Hanya menampilkan kamar yang tidak dapat digunakan

### Memperbarui Status Kamar

Setiap kartu kamar memiliki kontrol status di bagian bawahnya. Klik status baru yang diinginkan untuk langsung memperbarui status kamar tersebut.

> **Catatan:** Kamar yang sedang **Ditempati** (tamu sudah check-in) tidak dapat diubah ke status *Pemeliharaan* atau *Rusak* sampai tamu selesai check-out.

---

## 7. Pengaturan

Halaman **Pengaturan** digunakan oleh administrator untuk mengelola inventaris kamar, tipe kamar, dan akun staf.

> **Penting:** Akses ke halaman Pengaturan terbatas untuk pengguna dengan peran **Administrator**.

Halaman ini memiliki tiga bagian yang dapat dipilih melalui tab navigasi (desktop) atau dropdown (mobile):

---

### 7.1 Tipe Kamar

Tipe kamar mendefinisikan kategori kamar beserta kapasitasnya. Setiap kamar harus memiliki tipe.

**Melihat daftar tipe kamar:** Semua tipe ditampilkan dengan nama, kapasitas, jumlah kamar yang menggunakan tipe ini, dan deskripsi.

**Menambah tipe kamar baru:**

1. Klik **+ Tambah tipe kamar**.
2. Isi formulir:
   - **Nama** — Nama unik tipe kamar (contoh: "SDY – Perempuan Only")
   - **Kapasitas** — Jumlah tamu maksimum. Gunakan tombol **−** dan **+** untuk menyesuaikan.
   - **Deskripsi** *(opsional)*
3. Klik **Buat tipe kamar**.

**Mengedit tipe kamar:**

1. Klik **Kelola** pada baris tipe kamar yang ingin diubah.
2. Perbarui nama, kapasitas, atau deskripsi.
3. Klik **Simpan perubahan**.

> **Peringatan:** Perubahan pada tipe kamar akan diterapkan ke semua kamar yang menggunakan tipe tersebut.

**Menghapus tipe kamar:** Di bagian **Zona berbahaya** halaman edit, klik **Hapus tipe kamar**. Tipe kamar tidak dapat dihapus jika masih ada kamar yang menggunakannya.

---

### 7.2 Kamar

Bagian ini mengelola inventaris kamar individual.

**Melihat daftar kamar:** Ditampilkan dalam tabel dengan nomor kamar, lantai, tipe, status, dan riwayat masa inap.

**Memperbarui status banyak kamar sekaligus (Bulk Update):**

1. Centang kamar-kamar yang ingin diperbarui (atau centang semua dengan checkbox di header tabel).
2. Pilih status baru dari dropdown di bagian atas daftar.
3. Klik **Terapkan**.

**Menambah kamar baru:**

1. Klik **+ Tambah kamar**.
2. Isi formulir:
   - **Nomor kamar** — Nomor unik (contoh: "101", "A-205")
   - **Lantai** — Nomor lantai
   - **Tipe kamar** — Pilih dari tipe yang sudah dibuat
   - **Status operasional** — Status awal kamar
3. Klik **Buat kamar**.

**Mengedit kamar:**

1. Klik **Kelola** pada baris kamar.
2. Perbarui detail yang diperlukan.
3. Klik **Simpan perubahan**.

**Menghapus kamar:** Di bagian **Zona berbahaya** halaman edit, klik **Hapus kamar**. Kamar tidak dapat dihapus jika masih memiliki reservasi aktif.

---

### 7.3 Staf

Bagian ini mengelola akun pengguna yang memiliki akses ke sistem.

**Melihat daftar staf:** Ditampilkan dengan nama, email, peran, dan jumlah reservasi yang pernah dibuat.

**Menambah akun staf baru:**

1. Klik **+ Tambah anggota staf**.
2. Isi formulir:
   - **Nama lengkap**
   - **Email** — Digunakan sebagai username untuk masuk
   - **Peran** — Pilih peran yang sesuai (lihat bagian [Peran & Izin Akses](#8-peran--izin-akses))
   - **Kata sandi sementara** — Minimal 8 karakter
3. Klik **Buat akun staf**.

**Mengedit akun staf:**

1. Klik **Kelola** pada baris staf.
2. Perbarui nama, email, atau peran.
3. Untuk mengganti kata sandi, isi field **Kata sandi baru**. Biarkan kosong jika tidak ingin mengubahnya.
4. Klik **Simpan perubahan**.

> **Perhatian:** Mengubah peran atau kata sandi akan **mengeluarkan staf dari sesi aktif mereka** dan mengharuskan mereka untuk masuk kembali.

**Menghapus akun staf:** Di bagian **Zona berbahaya** halaman edit, klik **Hapus akun**. Akun tidak dapat dihapus jika:

- Akun tersebut adalah akun Anda sendiri
- Akun tersebut adalah satu-satunya Administrator yang tersisa
- Akun tersebut terkait dengan riwayat reservasi

---

## 8. Peran & Izin Akses

Sistem memiliki tiga peran pengguna dengan tingkat akses yang berbeda:

| Peran | Dashboard | Reservasi | Tamu | Kalender | Housekeeping | Pengaturan |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Administrator** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Resepsionis** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Housekeeping** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |

**Tips pemilihan peran:**

- Berikan peran **Administrator** hanya kepada manajer atau staf IT yang bertanggung jawab atas konfigurasi sistem.
- Berikan peran **Resepsionis** untuk staf front office yang menangani check-in/check-out dan reservasi harian.
- Berikan peran **Housekeeping** untuk staf kebersihan yang hanya perlu memantau dan memperbarui status kamar.

---

*Panduan ini berlaku untuk versi saat ini dari sistem Operasional Hotel.*
