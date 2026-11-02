import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Voter, 
  Candidate, 
  AnonymousVote, 
  SchoolSettings, 
  AuditLog, 
  VoteSummary 
} from '../types/voting.ts';
import { 
  INITIAL_SETTINGS, 
  INITIAL_CANDIDATES, 
  INITIAL_VOTERS, 
  INITIAL_ANONYMOUS_VOTES 
} from '../data/initialData.ts';
import { db } from '../lib/firebase.ts';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  writeBatch 
} from 'firebase/firestore';

interface VotingReceipt {
  candidate: Candidate;
  timestamp: string;
  verificationCode: string;
}

interface VotingContextType {
  settings: SchoolSettings;
  candidates: Candidate[];
  voters: Voter[];
  votes: AnonymousVote[];
  auditLogs: AuditLog[];
  currentVoter: Voter | null;
  lastVotedReceipt: VotingReceipt | null;
  isLoaded: boolean;
  isFirebaseConnected: boolean;
  
  // Auth
  login: (identitas: string, token: string) => { success: boolean; message: string; voter?: Voter };
  logout: () => void;
  quickSwitchUser: (voterId: string) => void;
  
  // Voting
  castVote: (candidateId: string) => Promise<{ success: boolean; message: string; receipt?: VotingReceipt }>;
  
  // Admin Operations
  updateSettings: (newSettings: Partial<SchoolSettings>) => Promise<void>;
  toggleElectionStatus: (open: boolean) => Promise<void>;
  toggleLiveCountStatus: (show: boolean) => Promise<void>;
  saveCandidate: (candidateData: Partial<Candidate> & { id?: string }) => Promise<void>;
  deleteCandidate: (candidateId: string) => Promise<void>;
  addVoter: (voterData: Omit<Voter, 'id' | 'is_voted' | 'voted_at'>) => Promise<void>;
  deleteVoter: (voterId: string) => Promise<void>;
  batchImportVoters: (importedList: Array<{ identitas: string; nama: string; role: 'siswa' | 'guru'; kelas_atau_jabatan: string }>) => Promise<number>;
  regenerateToken: (voterId: string) => Promise<string>;
  regenerateAllUnvotedTokens: () => Promise<number>;
  resetToDefaultData: () => Promise<void>;
  clearLastReceipt: () => void;
  
  // Analytics
  getVoteSummary: () => VoteSummary[];
  getParticipationStats: () => {
    totalDpt: number;
    totalVoted: number;
    turnoutPercent: number;
    studentTurnout: { total: number; voted: number; percent: number };
    teacherTurnout: { total: number; voted: number; percent: number };
  };
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'smanda_voting_settings',
  CANDIDATES: 'smanda_voting_candidates',
  VOTERS: 'smanda_voting_voters',
  VOTES: 'smanda_voting_votes',
  LOGS: 'smanda_voting_logs',
  SESSION: 'smanda_voting_session',
  RECEIPT: 'smanda_voting_receipt',
};

// Generate 6-digit random token
export function generateSecureToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1 for easy readability
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const VotingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });

  const [voters, setVoters] = useState<Voter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOTERS);
    return saved ? JSON.parse(saved) : INITIAL_VOTERS;
  });

  const [votes, setVotes] = useState<AnonymousVote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOTES);
    return saved ? JSON.parse(saved) : INITIAL_ANONYMOUS_VOTES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'log-init',
        action: 'Inisialisasi Sistem',
        actor: 'Sistem KPU SMANDA',
        timestamp: new Date().toISOString(),
        details: 'Sistem e-voting OSIS SMAN 2 Cibinong siap digunakan'
      }
    ];
  });

  const [currentVoter, setCurrentVoter] = useState<Voter | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
    return saved ? JSON.parse(saved) : null;
  });

  const [lastVotedReceipt, setLastVotedReceipt] = useState<VotingReceipt | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECEIPT);
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOTERS, JSON.stringify(voters));
  }, [voters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
  }, [votes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    if (currentVoter) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(currentVoter));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }, [currentVoter]);

  useEffect(() => {
    if (lastVotedReceipt) {
      localStorage.setItem(STORAGE_KEYS.RECEIPT, JSON.stringify(lastVotedReceipt));
    } else {
      localStorage.removeItem(STORAGE_KEYS.RECEIPT);
    }
  }, [lastVotedReceipt]);

  // Initial Firebase check and hydration
  useEffect(() => {
    let isMounted = true;
    async function initFirestore() {
      try {
        const settingsSnap = await getDocs(collection(db, 'settings'));
        if (isMounted) setIsFirebaseConnected(true);

        if (!settingsSnap.empty) {
          // Hydrate from Firestore if documents exist
          const settingsDoc = settingsSnap.docs[0].data() as SchoolSettings;
          if (settingsDoc && isMounted) setSettings(settingsDoc);

          const candSnap = await getDocs(collection(db, 'candidates'));
          if (!candSnap.empty && isMounted) {
            setCandidates(candSnap.docs.map(d => ({ ...d.data(), id: d.id } as Candidate)));
          }

          const voterSnap = await getDocs(collection(db, 'voters'));
          if (!voterSnap.empty && isMounted) {
            setVoters(voterSnap.docs.map(d => ({ ...d.data(), id: d.id } as Voter)));
          }

          const votesSnap = await getDocs(collection(db, 'votes'));
          if (!votesSnap.empty && isMounted) {
            setVotes(votesSnap.docs.map(d => ({ ...d.data(), id: d.id } as AnonymousVote)));
          }
        }
      } catch (err) {
        console.warn('Firestore initial sync notice (falling back gracefully to fast local state):', err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    initFirestore();
    return () => { isMounted = false; };
  }, []);

  // Log action helper
  const addLog = (action: string, actor: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      actor,
      timestamp: new Date().toISOString(),
      details
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // Login
  const login = (identitas: string, token: string) => {
    const cleanIdentitas = identitas.trim().toLowerCase();
    const cleanToken = token.trim().toUpperCase();

    const matched = voters.find(
      v => v.identitas.trim().toLowerCase() === cleanIdentitas && v.token.trim().toUpperCase() === cleanToken
    );

    if (!matched) {
      return { 
        success: false, 
        message: 'Kombinasi Identitas (NIS/NIP) dan Token tidak ditemukan. Pastikan 6 karakter token dimasukkan dengan benar.' 
      };
    }

    if (matched.role !== 'admin' && !settings.status_pemilu) {
      return {
        success: false,
        message: 'Sesi pemilihan saat ini sedang DITUTUP oleh Panitia KPU SMAN 2 Cibinong. Silakan hubungi pengawas bilik suara.'
      };
    }

    if (matched.role !== 'admin' && matched.is_voted) {
      return {
        success: false,
        message: `Akun ini sudah memberikan suara pada ${new Date(matched.voted_at || '').toLocaleTimeString('id-ID')}. Sesuai asas LUBER JURDIL, satu akun hanya memiliki satu suara sah.`
      };
    }

    setCurrentVoter(matched);
    addLog(
      'Login Berhasil', 
      matched.nama, 
      `Login berhasil sebagai ${matched.role === 'admin' ? 'Panitia Admin' : matched.role.toUpperCase()} (${matched.identitas})`
    );

    return { success: true, message: 'Login berhasil!', voter: matched };
  };

  const logout = () => {
    if (currentVoter) {
      addLog('Logout', currentVoter.nama, 'Pengguna keluar dari sesi aplikasi');
    }
    setCurrentVoter(null);
  };

  const quickSwitchUser = (voterId: string) => {
    const target = voters.find(v => v.id === voterId);
    if (target) {
      setCurrentVoter(target);
      addLog('Beralih Peran Cepat', 'Quick Switcher', `Beralih ke akun ${target.nama} (${target.role})`);
    }
  };

  const clearLastReceipt = () => {
    setLastVotedReceipt(null);
  };

  // Cast Vote with strict anonymity (LUBER JURDIL)
  const castVote = async (candidateId: string) => {
    if (!currentVoter) {
      return { success: false, message: 'Sesi tidak valid. Silakan login kembali.' };
    }

    if (!settings.status_pemilu) {
      return { success: false, message: 'Pemilihan sudah ditutup.' };
    }

    if (currentVoter.is_voted) {
      return { success: false, message: 'Anda sudah menggunakan hak pilih Anda.' };
    }

    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) {
      return { success: false, message: 'Pasangan calon tidak ditemukan.' };
    }

    const voteTimestamp = new Date().toISOString();
    const voteId = `vote-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // 1. Kotak Suara Anonim: TANPA IDENTITAS PEMILIH
    const newAnonymousVote: AnonymousVote = {
      id: voteId,
      candidate_id: candidateId,
      voter_role: currentVoter.role === 'guru' ? 'guru' : 'siswa',
      created_at: voteTimestamp,
    };

    // 2. Update status voter (is_voted = true)
    const updatedVoters = voters.map(v => {
      if (v.id === currentVoter.id) {
        return {
          ...v,
          is_voted: true,
          voted_at: voteTimestamp
        };
      }
      return v;
    });

    const verificationCode = `SMANDA-VOTE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const receipt: VotingReceipt = {
      candidate,
      timestamp: voteTimestamp,
      verificationCode
    };

    // Update state immediately
    setVotes(prev => [...prev, newAnonymousVote]);
    setVoters(updatedVoters);
    setCurrentVoter(prev => prev ? { ...prev, is_voted: true, voted_at: voteTimestamp } : null);
    setLastVotedReceipt(receipt);

    addLog(
      'Suara Diterima Sah', 
      'Kotak Suara Digital', 
      `1 Surat suara digital sah masuk ke kotak suara dari kategori pemilih: ${currentVoter.role}`
    );

    // Sync to Firestore in background
    try {
      await setDoc(doc(db, 'votes', voteId), newAnonymousVote);
      await setDoc(doc(db, 'voters', currentVoter.id), {
        ...currentVoter,
        is_voted: true,
        voted_at: voteTimestamp
      });
    } catch (err) {
      console.warn('Firestore vote sync saved locally:', err);
    }

    return { success: true, message: 'Suara Anda berhasil dicatat secara sah dan rahasia!', receipt };
  };

  // Admin updates
  const updateSettings = async (newSettings: Partial<SchoolSettings>) => {
    const updated = {
      ...settings,
      ...newSettings,
      updated_at: new Date().toISOString()
    };
    setSettings(updated);
    addLog('Ubah Pengaturan', currentVoter?.nama || 'Admin', 'Konfigurasi sekolah diperbarui');
    try {
      await setDoc(doc(db, 'settings', 'election_settings'), updated);
    } catch (err) {
      console.warn('Sync settings saved locally:', err);
    }
  };

  const toggleElectionStatus = async (open: boolean) => {
    await updateSettings({ status_pemilu: open });
    addLog(
      open ? 'Membuka Pemilihan' : 'Menutup Pemilihan', 
      currentVoter?.nama || 'Admin', 
      `Sesi pencoblosan resmi ${open ? 'DIBUKA' : 'DITUTUP'}`
    );
  };

  const toggleLiveCountStatus = async (show: boolean) => {
    await updateSettings({ status_live_count: show });
    addLog(
      'Ubah Akses Hasil', 
      currentVoter?.nama || 'Admin', 
      `Tampilan hasil suara ${show ? 'dibuka untuk umum' : 'dikunci untuk panitia'}`
    );
  };

  const saveCandidate = async (candidateData: Partial<Candidate> & { id?: string }) => {
    if (candidateData.id) {
      // Update
      const updated = candidates.map(c => c.id === candidateData.id ? { ...c, ...candidateData } as Candidate : c);
      setCandidates(updated);
      addLog('Update Kandidat', currentVoter?.nama || 'Admin', `Memperbarui data Paslon No. ${candidateData.nomor_urut}`);
      try {
        await setDoc(doc(db, 'candidates', candidateData.id), candidateData);
      } catch (err) {
        console.warn('Candidate sync locally:', err);
      }
    } else {
      // Create
      const newId = `paslon-${Date.now()}`;
      const newCand: Candidate = {
        id: newId,
        nomor_urut: candidateData.nomor_urut || candidates.length + 1,
        nama_ketua: candidateData.nama_ketua || 'Calon Ketua',
        nama_wakil: candidateData.nama_wakil || 'Calon Wakil',
        visi: candidateData.visi || '',
        misi: candidateData.misi || [],
        program_kerja: candidateData.program_kerja || [],
        foto_url: candidateData.foto_url || '/src/assets/images/paslon1_portrait_1793591739789.jpg',
        video_url: candidateData.video_url || '',
        warna_tema: candidateData.warna_tema || '#1E3A8A'
      };
      setCandidates(prev => [...prev, newCand]);
      addLog('Tambah Paslon', currentVoter?.nama || 'Admin', `Menambahkan Paslon No. ${newCand.nomor_urut}: ${newCand.nama_ketua}`);
      try {
        await setDoc(doc(db, 'candidates', newId), newCand);
      } catch (err) {
        console.warn('Candidate add locally:', err);
      }
    }
  };

  const deleteCandidate = async (candidateId: string) => {
    const cand = candidates.find(c => c.id === candidateId);
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
    addLog('Hapus Paslon', currentVoter?.nama || 'Admin', `Menghapus Paslon No. ${cand?.nomor_urut || candidateId}`);
  };

  const addVoter = async (voterData: Omit<Voter, 'id' | 'is_voted' | 'voted_at'>) => {
    const newId = `voter-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newVoter: Voter = {
      ...voterData,
      id: newId,
      token: voterData.token || generateSecureToken(),
      is_voted: false,
      voted_at: null
    };

    setVoters(prev => [newVoter, ...prev]);
    addLog('Tambah DPT', currentVoter?.nama || 'Admin', `Menambahkan pemilih ${newVoter.nama} (${newVoter.identitas})`);

    try {
      await setDoc(doc(db, 'voters', newId), newVoter);
    } catch (err) {
      console.warn('Add voter sync locally:', err);
    }
  };

  const deleteVoter = async (voterId: string) => {
    const voter = voters.find(v => v.id === voterId);
    setVoters(prev => prev.filter(v => v.id !== voterId));
    addLog('Hapus DPT', currentVoter?.nama || 'Admin', `Menghapus ${voter?.nama} (${voter?.identitas})`);
  };

  const batchImportVoters = async (
    importedList: Array<{ identitas: string; nama: string; role: 'siswa' | 'guru'; kelas_atau_jabatan: string }>
  ) => {
    const newVoters: Voter[] = importedList.map(item => ({
      id: `voter-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      identitas: item.identitas.trim(),
      nama: item.nama.trim(),
      role: item.role,
      kelas_atau_jabatan: item.kelas_atau_jabatan.trim(),
      token: generateSecureToken(),
      is_voted: false,
      voted_at: null
    }));

    setVoters(prev => [...newVoters, ...prev]);
    addLog('Impor Massal DPT', currentVoter?.nama || 'Admin', `Berhasil mengimpor ${newVoters.length} pemilih`);

    return newVoters.length;
  };

  const regenerateToken = async (voterId: string) => {
    const newToken = generateSecureToken();
    setVoters(prev => prev.map(v => v.id === voterId ? { ...v, token: newToken } : v));
    addLog('Regenerate Token', currentVoter?.nama || 'Admin', `Token baru dibuat untuk ID: ${voterId}`);
    return newToken;
  };

  const regenerateAllUnvotedTokens = async () => {
    let count = 0;
    setVoters(prev => prev.map(v => {
      if (!v.is_voted && v.role !== 'admin') {
        count++;
        return { ...v, token: generateSecureToken() };
      }
      return v;
    }));
    addLog('Regenerate Semua Token', currentVoter?.nama || 'Admin', `Berhasil me-refresh ${count} token pemilih belum mencoblos`);
    return count;
  };

  const resetToDefaultData = async () => {
    setSettings(INITIAL_SETTINGS);
    setCandidates(INITIAL_CANDIDATES);
    setVoters(INITIAL_VOTERS);
    setVotes(INITIAL_ANONYMOUS_VOTES);
    setCurrentVoter(null);
    setLastVotedReceipt(null);
    localStorage.clear();
    addLog('Reset Data Master', 'Admin KPU', 'Data direset kembali ke data bawaan simulasi SMAN 2 Cibinong');
  };

  // Calculations for analytics and charts
  const getVoteSummary = (): VoteSummary[] => {
    const totalVotesCount = votes.length;
    return candidates.map(c => {
      const candidateVotes = votes.filter(v => v.candidate_id === c.id);
      const studentVotes = candidateVotes.filter(v => v.voter_role === 'siswa').length;
      const teacherVotes = candidateVotes.filter(v => v.voter_role === 'guru').length;
      const count = candidateVotes.length;
      const percentage = totalVotesCount > 0 ? (count / totalVotesCount) * 100 : 0;

      return {
        candidateId: c.id,
        candidateNumber: c.nomor_urut,
        candidateName: `${c.nama_ketua} & ${c.nama_wakil}`,
        totalVotes: count,
        percentage: Number(percentage.toFixed(1)),
        votesByStudent: studentVotes,
        votesByTeacher: teacherVotes,
      };
    }).sort((a, b) => a.candidateNumber - b.candidateNumber);
  };

  const getParticipationStats = () => {
    const eligibleVoters = voters.filter(v => v.role !== 'admin');
    const totalDpt = eligibleVoters.length;
    const totalVoted = eligibleVoters.filter(v => v.is_voted).length;
    const turnoutPercent = totalDpt > 0 ? Number(((totalVoted / totalDpt) * 100).toFixed(1)) : 0;

    const students = eligibleVoters.filter(v => v.role === 'siswa');
    const studentVoted = students.filter(v => v.is_voted).length;
    const studentPercent = students.length > 0 ? Number(((studentVoted / students.length) * 100).toFixed(1)) : 0;

    const teachers = eligibleVoters.filter(v => v.role === 'guru');
    const teacherVoted = teachers.filter(v => v.is_voted).length;
    const teacherPercent = teachers.length > 0 ? Number(((teacherVoted / teachers.length) * 100).toFixed(1)) : 0;

    return {
      totalDpt,
      totalVoted,
      turnoutPercent,
      studentTurnout: { total: students.length, voted: studentVoted, percent: studentPercent },
      teacherTurnout: { total: teachers.length, voted: teacherVoted, percent: teacherPercent }
    };
  };

  return (
    <VotingContext.Provider
      value={{
        settings,
        candidates,
        voters,
        votes,
        auditLogs,
        currentVoter,
        lastVotedReceipt,
        isLoaded,
        isFirebaseConnected,
        login,
        logout,
        quickSwitchUser,
        castVote,
        updateSettings,
        toggleElectionStatus,
        toggleLiveCountStatus,
        saveCandidate,
        deleteCandidate,
        addVoter,
        deleteVoter,
        batchImportVoters,
        regenerateToken,
        regenerateAllUnvotedTokens,
        resetToDefaultData,
        clearLastReceipt,
        getVoteSummary,
        getParticipationStats,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};
