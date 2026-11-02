# OSISVote — Sistem E-Voting Pemilihan Ketua OSIS SMAN 2 Cibinong

Aplikasi e-voting berbasis web berstandar LUBER JURDIL (Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil) yang dirancang khusus untuk SMAN 2 Cibinong. Sistem ini menyediakan portal pemilih yang responsif bagi siswa dan guru serta dashboard komprehensif bagi Panitia Pemilihan (KPU Sekolah) untuk mengelola kandidat, mengimpor DPT, mendistribusikan token, mencetak kartu suara, memantau perolehan suara, dan mencetak Berita Acara resmi.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Utama yang Dikonfirmasi dari Sesi Klarifikasi:**
> - **Branding & Identitas Sekolah**: Identitas visual resmi SMA Negeri 2 Cibinong lengkap dengan lambang sekolah, palet warna almamater (Navy Blue & Gold Accent), dan pengaturan profil sekolah yang dapat dikustomisasi panitia.
> - **Inisialisasi Data Awal**: Disediakan data realistis lengkap (3 paslon ketua & wakil OSIS dengan foto, visi, misi, program kerja; data DPT contoh untuk kelas X, XI, XII dan Guru/Staf; serta panel *Quick Test Switcher* untuk pengujian instan peran Admin, Siswa, dan Guru).
> - **Format Distribusi Token**: Dilengkapi generator Kartu Pemilih fisik siap cetak (format grid A4 dengan QR code & token 6-digit) serta generator pesan WhatsApp otomatis yang memuat tautan masuk langsung untuk tiap pemilih.

- **Kerahasiaan Suara (Anonymity By Design)**: Sesuai cetak biru, tabel `users` (status `is_voted`) dan tabel `votes` (kotak suara digital) terputus tanpa `user_id`. Panitia dapat memverifikasi siapa yang sudah hadir/memilih, namun pilihan suara tetap rahasia mutlak.
- **Kontrol Sesi Pemilihan**: Pemilihan dapat dibuka atau ditutup secara instan oleh panitia. Hasil perolehan suara (Live Count) dapat dikunci selama pemungutan suara berlangsung agar tidak menggiring opini pemilih, dan dibuka saat pleno penutupan.

---

### 1. Overview & Core Concept

- **Fungsi Utama**: Platform pemungutan suara digital terintegrasi yang menggantikan bilik suara konvensional dan kertas suara manual dengan sistem digital yang aman, anti-pencoblosan ganda (anti-double voting), hemat biaya cetak, dan akurat hingga detik terakhir.
- **Target Pengguna**:
  1. **Siswa (Pemilih)**: Masuk menggunakan NIS (Nomor Induk Siswa) dan PIN Token acak 6 karakter.
  2. **Guru & Tenaga Kependidikan (Pemilih)**: Masuk menggunakan NIP/NUPTK dan PIN Token acak.
  3. **Panitia Pemilihan / KPU OSIS (Admin)**: Memiliki akses penuh ke manajemen paslon, impor/ekspor DPT, generator token, cetak kartu, kontrol status pemilu, dan rekapitulasi suara.
- **Nilai Unggulan**:
  - Nol instalasi (dapat diakses via browser HP, tablet, maupun PC laboratorium sekolah).
  - Keamanan berlapis dengan token unik sekali pakai (one-time token).
  - Tanda terima digital dengan cap stempel "Telah Memberikan Suara" (Digital Ink).
  - Cetak otomatis Berita Acara Hasil Rekapitulasi Suara lengkap dengan persentase partisipasi pemilih.

---

### 2. User Experience & Visual Design

#### A. Alur Pengguna (User Flows)

1. **Alur Pemilih (Siswa & Guru)**:
   - **Halaman Masuk (Auth Gate)**: Pemilih memilih tab identitas (Siswa: NIS | Guru: NIP) dan memasukkan 6-digit token rahasia. Tersedia tombol *Scan QR Code* untuk pemilih yang menggunakan kamera HP dari kartu cetak.
   - **Etalase Pasangan Calon (Ballot View)**: Menampilkan kartu kandidat nomor urut 01, 02, 03 dengan foto formal seragam OSIS/sekolah, nama Ketua & Wakil, visi, misi terstruktur, dan tautan/modal video orasi kampanye.
   - **Modal Konfirmasi Suara**: Saat menekan tombol "Coblos Paslon", muncul dialog konfirmasi tegas dengan foto kandidat terpilih: *"Apakah Anda yakin memilih Paslon No. [X]? Pilihan tidak dapat diubah kembali."*
   - **Tanda Terima Suara Digital (Digital Ink)**: Setelah konfirmasi, sistem mencatat suara ke kotak suara anonim, menandai akun telah memilih, dan menampilkan bukti sah pencoblosan dengan stempel digital, kode hash verifikasi unik, serta waktu pemungutan suara. Akun terkunci otomatis.

2. **Alur Panitia / Admin KPU Sekolah**:
   - **Overview Dashboard**: Status pemilu (Buka/Tutup), kartu statistik total DPT, suara masuk, partisipasi (%), dan sisa pemilih yang belum hadir.
   - **Manajemen Paslon**: Tambah/edit paslon, nomor urut, foto, visi & misi, video orasi, dan preview kartu suara.
   - **Daftar Pemilih Tetap (DPT)**: Tabel data pemilih terpadu dengan pencarian cepat, filter kelas/role, status memilih, tombol tambah manual, import via CSV/Excel, ekspor data, serta tombol *Generate Ulang Token*.
   - **Pusat Distribusi Token**:
     - *Cetak Kartu Pemilih*: Tata letak grid kartu (8 kartu per lembar A4) siap cetak/PDF berisi Logo Sekolah, Nama Siswa, NIS/NIP, Kelas, QR Code login, dan instruksi pencoblosan.
     - *Generator WhatsApp*: Templat pesan otomatis berisi salam resmi, instruksi, dan kredensial login yang dapat disalin atau dikirim langsung ke nomor kontak wali kelas/siswa.
   - **Live Count & Hasil Pemilihan**: Grafik pie chart dan bar chart perolehan suara paslon, breakdown partisipasi per tingkat kelas (X, XI, XII, Guru), serta tombol *Generate Berita Acara (BAST)* resmi berkop surat sekolah yang siap dicetak dan ditandatangani Ketua KPU, Pembina OSIS, dan Saksi Paslon.

3. **Alur Pengujian Cepat (Quick Demo Switcher)**:
   - Panel melayang (drawer) di sudut layar untuk beralih instan antara: Admin KPU, Siswa Kelas X (Belum Memilih), Siswa Kelas XII (Sudah Memilih), dan Guru (Belum Memilih), memudahkan evaluasi sistem.

#### B. Identitas Visual & Tema

- **Arah Estetika**: *Modern Academic & Civic Trust* — profesional, bersih, berwibawa, dan sangat mudah dibaca oleh siswa maupun guru.
- **Palet Warna**:
  - **Canvas Dominan (60%)**: Background netral bersih (`#F8FAFC` slate-50 / dark: `#0B1120`).
  - **Permukaan Struktural (30%)**: Putih bersih (`#FFFFFF` / dark: `#131D31`) dengan garis batas halus (`border-slate-200 dark:border-slate-800`).
  - **Aksen Almamater & Tindakan (10%)**: Deep Academy Blue (`#1E3A8A` / `#2563EB`) untuk tombol utama dan status resmi, Emerald Green (`#059669`) untuk status suara masuk / berhasil, dan Amber Warm (`#D97706`) untuk peringatan.
- **Tipografi**:
  - Display & Headings: **Plus Jakarta Sans** (tegas, modern, standar identitas digital Indonesia).
  - Body & Form: **Plus Jakarta Sans** (keterbacaan tinggi pada layar mobile).
  - Angka, Token & Rekapitulasi: **JetBrains Mono / Tabular Numbers** (`tabular-nums`) untuk token 6 karakter dan angka perolehan suara agar tidak bergeser (*zero jitter*).
- **Anti-Slop Restraint**: Tidak ada pill badge berlebihan, tidak ada pseudo-code header (`// 01`), tanpa watermark buram di latar belakang, dan tombol aksi menggunakan instruksi bahasa Indonesia yang lugas ("Masuk", "Coblos Paslon", "Cetak Berita Acara", "Buka Sesi Pemilihan").

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Pemisahan Data Pemilih dan Kotak Suara (Prinsip Asas Rahasia)**
  - *Pendekatan*: Tabel `users` hanya menyimpan `is_voted: true/false` dan `voted_at`. Tabel `votes` hanya menyimpan `candidate_id` dan `timestamp` tanpa referensi ID siswa/guru.
  - *Alasan*: Menjamin kerahasiaan suara mutlak (panitia bahkan developer tidak dapat melacak paslon mana yang dicoblos oleh siswa/guru tertentu).
  - *Alternatif*: Menyimpan `voted_candidate_id` di profil user — ditolak karena melanggar asas LUBER JURDIL dan etika pemilu.

- **Keputusan 2: Arsitektur Data Berkelanjutan (State Engine dengan LocalStorage & Backup)**
  - *Pendekatan*: Menggunakan lapisan data reaktif terpusat dengan persistensi `localStorage` otomatis serta fitur pencadangan (Backup JSON) dan pemulihan (Restore JSON), plus tombol *Reset to SMAN 2 Demo Data*.
  - *Alasan*: Menjamin aplikasi langsung siap dipakai saat preview, tidak membutuhkan setup database cloud eksternal yang rumit saat uji coba, data tetap tersimpan saat refresh, dan panitia sekolah dapat mengekspor atau memindahkan data ke perangkat sekolah lain dengan mudah.

- **Keputusan 3: Desain Kartu Pemilih Siap Cetak (A4 Print-Ready CSS)**
  - *Pendekatan*: Menyediakan tampilan cetak khusus (`@media print`) yang memformat kartu pemilih ke dalam grid rapi ukuran kartu tanda pemilih standar dengan garis potong (cut guide), logo SMAN 2 Cibinong, QR code, dan token tebal.
  - *Alasan*: Sangat ramah operasional panitia sekolah yang ingin membagikan kartu fisik saat apel pagi atau via wali kelas sebelum pemilihan dimulai.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   OSISVote SMAN 2 CIBINONG ARCHITECTURE                 │
└────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│     PORTAL PEMILIH        │                   │     PANEL ADMIN KPU       │
│  (Siswa NIS & Guru NIP)   │                   │  (Panitia Pemilihan OSIS) │
├───────────────────────────┤                   ├───────────────────────────┤
│ • Login NIS/NIP + Token   │                   │ • Kontrol Sesi (Buka/Tutup│
│ • QR Code Quick Login     │                   │ • Manajemen Paslon CRUD   │
│ • Etalase Paslon Visi-Misi│                   │ • Impor DPT (CSV / Excel) │
│ • Modal Konfirmasi Coblos │                   │ • Generator Token Acak    │
│ • Tanda Terima Digital    │                   │ • Cetak Kartu Pemilih PDF │
│ • Penguncian Akun Suara   │                   │ • Realtime Live Count     │
└─────────────┬─────────────┘                   │ • Cetak Berita Acara BAST │
              │                                 └─────────────┬─────────────┘
              │  (Otentikasi & Pencoblosan)                   │
              ▼                                               ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                 STATE MANAGEMENT & SECURITY ENGINE                        │
├───────────────────────────────────────────────────────────────────────────┤
│ • Auth Guard: Cek identitas + Token + Status `is_voted`                   │
│ • Ballot Isolation: Menulis suara ke kotak suara TANPA relasi pemilih    │
│ • Auto Token Generator: Kriptografis 6 karakter alfanumerik acak         │
│ • Print & Export Engine: Print CSS formatting, CSV parser, JSON backup    │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           ENTITAS DATA UTAMA                              │
├───────────────────────────────────────────────────────────────────────────┤
│ 1. `SchoolSettings`: Nama sekolah, logo, tahun ajaran, status_pemilu,    │
│    status_live_count (apakah hasil dapat dilihat publik/terkunci).        │
│ 2. `Candidates`: id, nomor_urut, nama_ketua, nama_wakil, foto_url,       │
│    visi, misi, program_unggulan, video_url.                               │
│ 3. `Users (DPT)`: id, role ('admin'|'siswa'|'guru'), identitas (NIS/NIP), │
│    nama, kelas_atau_jabatan, token (unik), is_voted, voted_at.            │
│ 4. `Votes (Kotak Suara)`: id, candidate_id, created_at.                  │
│ 5. `AuditLogs`: Catatan aktivitas penting (waktu buka sesi, jumlah impor) │
└───────────────────────────────────────────────────────────────────────────┘
```

#### Struktur Komponen & Alokasi Fitur:
1. `src/types/voting.ts`: Definisi tipe data lengkap TypeScript (`User`, `Candidate`, `Vote`, `SchoolSettings`, `Role`, `VoteSummary`).
2. `src/data/initialData.ts`: Data awal realistis SMAN 2 Cibinong (3 paslon lengkap dengan visi-misi kontekstual sekolah, ~30 sampel pemilih kelas X-E1 s.d. XII-MIPA dan jajaran guru, konfigurasi sekolah).
3. `src/context/VotingContext.tsx`: Provider pusat yang mengelola otentikasi aktif, state DPT, kotak suara, status pemilu, dan aksi-aksi CRUD.
4. `src/components/Navbar.tsx`: Header 3 zona bersih sesuai kontrak desain: Logo & Nama SMAN 2 OSISVote, indikator status pemilu (Buka/Tutup), dan aksi peran/logout.
5. `src/components/VoterPortal/`:
   - `VoterLogin.tsx`: Input NIS/NIP + Token dengan validasi instan, bantuan demo, dan tombol scan QR simulasi.
   - `CandidateShowcase.tsx`: Kartu paslon dengan tata letak visual elegan, badge nomor urut, visi, misi, dan tombol coblos.
   - `VoteConfirmationModal.tsx`: Dialog konfirmasi pencegah salah klik.
   - `DigitalReceipt.tsx`: Tanda bukti sah dengan stempel "TELAH MEMILIH", ID verifikasi acak, dan tombol cetak bukti/logout.
6. `src/components/AdminPanel/`:
   - `AdminOverview.tsx`: Metrik partisipasi, kartu quick action, tombol buka/tutup pemilihan.
   - `CandidateManager.tsx`: Form tambah/edit kandidat, upload/pilih avatar foto, kelola visi misi.
   - `DptManager.tsx`: Tabel pemilih, pencarian, filter status, modal import CSV, tambah pemilih baru, generator token massal.
   - `TokenDistributionModal.tsx`: Tampilan cetak kartu pemilih A4 (8 kartu/halaman dengan QR code) dan copy teks broadcast WhatsApp.
   - `LiveCountResults.tsx`: Grafik perolehan suara (Bar chart & Donut chart), rincian persentase, dan partisipasi per kelas.
   - `OfficialReportModal.tsx`: Dokumen Berita Acara Hasil Pemilihan resmi SMAN 2 Cibinong siap cetak untuk tanda tangan KPU & Saksi.
7. `src/components/DemoSwitcher.tsx`: Floating switch untuk memudahkan penguji berpindah antar peran (Admin, Siswa Belum Memilih, Guru Belum Memilih, Siswa Sudah Memilih) dalam satu klik.
