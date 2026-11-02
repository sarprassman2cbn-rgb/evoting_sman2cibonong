export type Role = 'admin' | 'siswa' | 'guru';

export interface Voter {
  id: string;
  identitas: string; // NIS untuk Siswa, NIP untuk Guru, Username untuk Admin
  nama: string;
  role: Role;
  kelas_atau_jabatan: string;
  token: string;
  is_voted: boolean;
  voted_at: string | null;
}

export interface Candidate {
  id: string;
  nomor_urut: number;
  nama_ketua: string;
  nama_wakil: string;
  visi: string;
  misi: string[];
  program_kerja: string[];
  foto_url: string;
  video_url?: string;
  warna_tema?: string;
}

export interface AnonymousVote {
  id: string;
  candidate_id: string;
  voter_role: 'siswa' | 'guru';
  created_at: string;
}

export interface SchoolSettings {
  school_name: string;
  school_tagline: string;
  school_badge_url: string;
  academic_year: string;
  status_pemilu: boolean;
  status_live_count: boolean;
  election_date: string;
  kpu_chairperson: string;
  osis_advisor: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

export interface VoteSummary {
  candidateId: string;
  candidateNumber: number;
  candidateName: string;
  totalVotes: number;
  percentage: number;
  votesByStudent: number;
  votesByTeacher: number;
}
