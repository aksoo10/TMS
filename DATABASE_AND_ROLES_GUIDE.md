# ANDRITZ ISC — Tool Management System (TMS)
## Dokumentasi Database & Role-Based Access Control (RBAC) Localhost

Database telah berhasil dibuat dan aktif di server MySQL localhost Laragon.

---

### 1. Informasi Koneksi Database Localhost
- **Database Name**: `tms_isc`
- **Host**: `127.0.0.1` atau `localhost`
- **Port**: `3306`
- **User**: `root`
- **Password**: *(kosong / tanpa password)*
- **Charset / Collation**: `utf8mb4` / `utf8mb4_unicode_ci`
- **SQL Backup / Master Schema File**: `database/tms_isc.sql`

---

### 2. Struktur Tabel Database (`tms_isc`)
| Nama Tabel | Deskripsi & Isi |
|---|---|
| `roles` | Daftar peran hak akses (Super Admin, Tool Engineer, Site Supervisor, dll.) |
| `permissions` | Izin fitur granular (`tools_manage`, `movements_create`, `inspection_manage`, dll.) |
| `role_permissions` | Relasi Many-to-Many antara Role dan Permission |
| `users` | Akun pengguna terhubung dengan `role_id` dan `site_id` |
| `sites` | Master data 6 site resmi ANDRITZ |
| `tools` | Master katalog perkakas, material number SAP, barcode, status kelaikan |
| `tool_movements` | Transaksi pergerakan armada (Check-Out, Check-In, Inter-Site Transfer) |
| `inspections` | Lembar inspeksi QA/QC fisik, checklist elektrikal/mekanikal, sertifikat |
| `historical_logs` | Audit trail otomatis seluruh aktivitas pengguna dan pergerakan alat |

---

### 3. Matriks Role & Hak Akses (RBAC)
Sistem memiliki 6 peran kerja resmi:

1. **Super Admin** (`super-admin` | ID: 1)
   - **User Default**: Hendro Wibowo (`hendro.wibowo@andritz.com`) — Site ISC
   - **Hak Akses**: Hak penuh (`all`) ke seluruh modul, manajemen peran, manajemen pengguna, konfigurasi site, dan audit log.

2. **Tool Engineer** (`tool-engineer` | ID: 2)
   - **User Default**: Bambang Santoso (`bambang.santoso@andritz.com`) — Site ISC
   - **Hak Akses**: Pendaftaran alat baru, kelola spesifikasi teknik, verifikasi jadwal kalibrasi, monitoring inspeksi.

3. **Site Supervisor** (`site-supervisor` | ID: 3)
   - **User Default**: Reza Pratama (`reza.pratama@andritz.com`) — Site OKI I
   - **Hak Akses**: Permohonan peminjaman tools (*Check-Out*), transfer alat antar-site (*Inter-Site Transfer*), pelacakan nomor Work Order (WO).

4. **Quality Inspector** (`quality-inspector` | ID: 4)
   - **User Default**: Siti Rahmawati (`siti.rahmawati@andritz.com`) — Site TELL
   - **Hak Akses**: Pengisian formulir inspeksi berkala, verifikasi checklist kelaikan keselamatan, penerbitan sertifikat lulus uji.

5. **Warehouse Operator** (`warehouse-operator` | ID: 5)
   - **User Default**: Dedi Kurniawan (`dedi.kurniawan@andritz.com`) — Site IKPP
   - **Hak Akses**: Pemindaian barcode, penerimaan pengembalian (*Check-In*), verifikasi kondisi fisik dasar sebelum alat disimpan di rak bin.

6. **Auditor / Viewer** (`viewer` | ID: 6)
   - **User Default**: Fajar Nugraha (`fajar.nugraha@andritz.com`) — Site OKI II
   - **Hak Akses**: Hak baca (*Read-only*) laporan analitik, statistik utilisasi, dan riwayat historical log tanpa izin mengubah data.

---

### 4. 6 Site Resmi yang Tersimpan di Database
1. `SITE-IKPP` — **Site IKPP** (Perawang, Siak, Riau)
2. `SITE-IKPD` — **Site IKPD** (Riau)
3. `SITE-OKI-1` — **Site OKI I** (Ogan Komering Ilir, South Sumatra)
4. `SITE-OKI-2` — **Site OKI II** (Ogan Komering Ilir, South Sumatra)
5. `SITE-TELL` — **Site TELL** (Muara Enim, South Sumatra)
6. `SITE-ISC` — **Site ISC** (Pekanbaru, Riau — Central Hub)

---

### 5. REST API Localhost yang Disediakan
Tersedia endpoint PHP RESTful API di Nginx Laragon (`http://localhost/TMS-ISC/api/`):
- `GET http://localhost/TMS-ISC/api/` : Status koneksi database & statistik
- `GET http://localhost/TMS-ISC/api/roles.php` : Daftar peran & permission
- `GET http://localhost/TMS-ISC/api/users.php` : Daftar pengguna & penugasan peran
- `GET http://localhost/TMS-ISC/api/sites.php` : Master 6 site
- `GET http://localhost/TMS-ISC/api/tools.php` : Master database perkakas
- `POST http://localhost/TMS-ISC/api/tools.php` : Tambah registrasi perkakas baru
- `GET http://localhost/TMS-ISC/api/movements.php` : Transaksi pergerakan alat
- `GET http://localhost/TMS-ISC/api/inspections.php` : Hasil inspeksi & sertifikat
- `GET http://localhost/TMS-ISC/api/historical.php` : Log audit trail historical
