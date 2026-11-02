import { Candidate, SchoolSettings, Voter, AnonymousVote } from '../types/voting.ts';

export const INITIAL_SETTINGS: SchoolSettings = {
  school_name: 'SMA Negeri 2 Cibinong',
  school_tagline: 'Unggul dalam Prestasi, Berkarakter, dan Berwawasan Lingkungan',
  school_badge_url: '/src/assets/images/school_emblem_logo_1793591740225.jpg',
  academic_year: 'Periode 2026/2027',
  status_pemilu: true, // Sesi pemilihan dibuka
  status_live_count: true, // Hasil suara dapat dipantau
  election_date: 'Senin, 02 November 2026',
  kpu_chairperson: 'Drs. H. Mulyadi, M.Pd.',
  osis_advisor: 'Rahmat Hidayat, S.Pd.',
  updated_at: new Date().toISOString(),
};

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'paslon-1',
    nomor_urut: 1,
    nama_ketua: 'Muhammad Farhan Al-Ghifari',
    nama_wakil: 'Sarah Ayu Larasati',
    foto_url: '/src/assets/images/paslon1_portrait_1793591739789.jpg',
    visi: 'Mewujudkan OSIS SMAN 2 Cibinong yang Berkarakter, Kolaboratif, Berprestasi, dan Berwawasan Global di Era Digital.',
    misi: [
      'Membangun komunikasi aktif dan inklusif antar seluruh ekstrakurikuler serta perwakilan kelas',
      'Mengoptimalkan digitalisasi aspirasi siswa melalui kanal aspirasi cepat tanggap',
      'Meningkatkan kepedulian sosial, literasi, dan pelestarian lingkungan hidup sekolah',
      'Mengembangkan minat bakat siswa menuju kompetisi sains, seni, dan olahraga tingkat nasional'
    ],
    program_kerja: [
      'SMANDA Fest & Education Career Expo',
      'Aplikasi Suara Siswa Digital Terbuka',
      'Gerakan Green School & Zero Waste SMANDA',
      'Pekan Kolaborasi Ekskul Tahunan'
    ],
    video_url: 'https://www.youtube.com',
    warna_tema: '#1E3A8A'
  },
  {
    id: 'paslon-2',
    nomor_urut: 2,
    nama_ketua: 'Bima Aditya Nugraha',
    nama_wakil: 'Siti Aisyah Azzahra',
    foto_url: '/src/assets/images/paslon2_portrait_1793591740886.jpg',
    visi: 'Membangun Generasi SMANDA yang Unggul, Berintegritas Tinggi, Berbudaya, dan Siap Bersinergi Menuju Indonesia Emas.',
    misi: [
      'Menanamkan nilai budi pekerti luhur, toleransi, dan kedisiplinan sekolah berkarakter',
      'Mewadahi kreativitas siswa melalui panggung apresiasi seni dan pekan kreasi bulanan',
      'Mengadakan program tutor sebaya untuk pemerataan prestasi akademik siswa',
      'Mempererat jejaring kemitraan dengan alumni serta perguruan tinggi kedinasan'
    ],
    program_kerja: [
      'SMANDA Peer-Tutoring Camp & Bedah Soal PTN',
      'Gelar Budaya Nusantara & Pentas Teater',
      'Bazar Kewirausahaan Mandiri Siswa',
      'Kemitraan Alumni Care SMANDA'
    ],
    video_url: 'https://www.youtube.com',
    warna_tema: '#B45309'
  },
  {
    id: 'paslon-3',
    nomor_urut: 3,
    nama_ketua: 'Rizky Maulana Pratama',
    nama_wakil: 'Amanda Putri Kinanti',
    foto_url: '/src/assets/images/paslon3_portrait_1793591740831.jpg',
    visi: 'Transformasi OSIS yang Progresif, Transparan, Berdaya Saing Sains-Teknologi, serta Mengedepankan Solidaritas.',
    misi: [
      'Mewujudkan keterbukaan tata kelola dan transparansi program kerja OSIS secara berkala',
      'Menggalakkan kompetisi e-sports terarah dan kelompok karya ilmiah remaja (KIR)',
      'Membuat program reward penghargaan siswa berprestasi di setiap akhir semester',
      'Menciptakan ruang kreasi multimedia, podcast edukatif, dan media informasi interaktif'
    ],
    program_kerja: [
      'SMANDA E-Sports & Science Olympiad',
      'Podcast Edukasi Gelora SMANDA',
      'Bintang Prestasi & Apresiasi Karakter',
      'Studio Konten Kreatif Siswa'
    ],
    video_url: 'https://www.youtube.com',
    warna_tema: '#047857'
  }
];

export const INITIAL_VOTERS: Voter[] = [
  // Admin Panitia KPU
  {
    id: 'voter-admin-1',
    identitas: 'admin_kpu',
    nama: 'Panitia KPU SMAN 2 Cibinong',
    role: 'admin',
    kelas_atau_jabatan: 'Panitia Pemilihan OSIS',
    token: 'KPU778',
    is_voted: false,
    voted_at: null
  },
  // Siswa Belum Memilih (Siap dites langsung)
  {
    id: 'voter-s1',
    identitas: '2425101',
    nama: 'Aditya Pratama Wibowo',
    role: 'siswa',
    kelas_atau_jabatan: 'X-E1',
    token: 'SMN101',
    is_voted: false,
    voted_at: null
  },
  {
    id: 'voter-s2',
    identitas: '2425102',
    nama: 'Cantika Dewi Maharani',
    role: 'siswa',
    kelas_atau_jabatan: 'X-E2',
    token: 'SMN102',
    is_voted: false,
    voted_at: null
  },
  {
    id: 'voter-s3',
    identitas: '2324201',
    nama: 'Dimas Bagus Saputra',
    role: 'siswa',
    kelas_atau_jabatan: 'XI-MIPA 1',
    token: 'SMN201',
    is_voted: false,
    voted_at: null
  },
  {
    id: 'voter-s4',
    identitas: '2324202',
    nama: 'Fathia Nur Sabrina',
    role: 'siswa',
    kelas_atau_jabatan: 'XI-IPS 2',
    token: 'SMN202',
    is_voted: false,
    voted_at: null
  },
  {
    id: 'voter-s5',
    identitas: '2223301',
    nama: 'Gilang Ramadhan Santoso',
    role: 'siswa',
    kelas_atau_jabatan: 'XII-MIPA 1',
    token: 'SMN301',
    is_voted: false,
    voted_at: null
  },
  // Guru Belum Memilih
  {
    id: 'voter-g1',
    identitas: '197508122005011003',
    nama: 'Dra. Hj. Sri Wahyuni, M.Pd.',
    role: 'guru',
    kelas_atau_jabatan: 'Guru Matematika / Wali Kelas X-E1',
    token: 'GUR801',
    is_voted: false,
    voted_at: null
  },
  {
    id: 'voter-g2',
    identitas: '198203152010012008',
    nama: 'Bambang Sudarsono, S.Pd., M.T.',
    role: 'guru',
    kelas_atau_jabatan: 'Guru Fisika & Robotik',
    token: 'GUR802',
    is_voted: false,
    voted_at: null
  },
  // Siswa Sudah Memilih (Untuk contoh status terproteksi)
  {
    id: 'voter-sv1',
    identitas: '2425103',
    nama: 'Hafiz Al-Fikri',
    role: 'siswa',
    kelas_atau_jabatan: 'X-E1',
    token: 'SMN103',
    is_voted: true,
    voted_at: '2026-11-02T08:15:20.000Z'
  },
  {
    id: 'voter-sv2',
    identitas: '2425104',
    nama: 'Indah Kusuma Wardani',
    role: 'siswa',
    kelas_atau_jabatan: 'X-E3',
    token: 'SMN104',
    is_voted: true,
    voted_at: '2026-11-02T08:24:12.000Z'
  },
  {
    id: 'voter-sv3',
    identitas: '2324203',
    nama: 'Kevin Jonathan',
    role: 'siswa',
    kelas_atau_jabatan: 'XI-MIPA 2',
    token: 'SMN203',
    is_voted: true,
    voted_at: '2026-11-02T08:35:45.000Z'
  },
  {
    id: 'voter-sv4',
    identitas: '2324204',
    nama: 'Laila Zahra Nurul',
    role: 'siswa',
    kelas_atau_jabatan: 'XI-IPS 1',
    token: 'SMN204',
    is_voted: true,
    voted_at: '2026-11-02T08:42:10.000Z'
  },
  {
    id: 'voter-sv5',
    identitas: '2223302',
    nama: 'Muhammad Ilham Fauzi',
    role: 'siswa',
    kelas_atau_jabatan: 'XII-MIPA 3',
    token: 'SMN302',
    is_voted: true,
    voted_at: '2026-11-02T08:50:33.000Z'
  },
  {
    id: 'voter-sv6',
    identitas: '2223303',
    nama: 'Nabila Shafa Amanda',
    role: 'siswa',
    kelas_atau_jabatan: 'XII-IPS 1',
    token: 'SMN303',
    is_voted: true,
    voted_at: '2026-11-02T08:55:18.000Z'
  },
  {
    id: 'voter-gv1',
    identitas: '196805191994121001',
    nama: 'Drs. Hendra Setiawan',
    role: 'guru',
    kelas_atau_jabatan: 'Guru PPKn / Pembina OSIS',
    token: 'GUR803',
    is_voted: true,
    voted_at: '2026-11-02T08:05:00.000Z'
  }
];

export const INITIAL_ANONYMOUS_VOTES: AnonymousVote[] = [
  // Suara paslon-1
  { id: 'vote-1', candidate_id: 'paslon-1', voter_role: 'siswa', created_at: '2026-11-02T08:15:20.000Z' },
  { id: 'vote-2', candidate_id: 'paslon-1', voter_role: 'siswa', created_at: '2026-11-02T08:24:12.000Z' },
  { id: 'vote-3', candidate_id: 'paslon-1', voter_role: 'guru', created_at: '2026-11-02T08:05:00.000Z' },
  // Suara paslon-2
  { id: 'vote-4', candidate_id: 'paslon-2', voter_role: 'siswa', created_at: '2026-11-02T08:35:45.000Z' },
  { id: 'vote-5', candidate_id: 'paslon-2', voter_role: 'siswa', created_at: '2026-11-02T08:42:10.000Z' },
  // Suara paslon-3
  { id: 'vote-6', candidate_id: 'paslon-3', voter_role: 'siswa', created_at: '2026-11-02T08:50:33.000Z' },
  { id: 'vote-7', candidate_id: 'paslon-3', voter_role: 'siswa', created_at: '2026-11-02T08:55:18.000Z' }
];
