import { StudentSession, StudentProfile, EmotionCheckIn, QuestionSubmission } from '../types/math';

const CURRENT_SESSION_KEY = 'mathdraw_current_student_v1';
const ALL_SESSIONS_KEY = 'mathdraw_all_sessions_v1';
const SEEDED_FLAG_KEY = 'mathdraw_seeded_flag_v1';

// Generate a clean sample SVG data URI for demo drawing
function generateSampleCanvas(shapeTitle: string, mathText: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#fffdfa"/>
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#fed7aa" stroke-width="0.7" opacity="0.6"/>
      </pattern>
    </defs>
    <rect width="600" height="400" fill="url(#grid)" />
    <text x="30" y="50" font-family="sans-serif" font-size="18" font-weight="bold" fill="#ea580c">Lembar Coretan Siswa: ${shapeTitle}</text>
    <path d="M 50 100 L 200 100 L 200 250 L 50 250 Z" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
    <text x="110" y="90" font-family="sans-serif" font-size="14" fill="#2563eb">s = 4 cm</text>
    <text x="260" y="110" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="bold">Diketahui &amp; Perhitungan:</text>
    <text x="260" y="140" font-family="sans-serif" font-size="14" fill="#334155">${mathText}</text>
    <text x="260" y="170" font-family="sans-serif" font-size="14" fill="#334155">Luas = 64 cm² ÷ 4 = 16 cm²</text>
    <text x="260" y="200" font-family="sans-serif" font-size="14" fill="#334155">s = √16 = 4 cm</text>
    <path d="M 260 220 L 480 220" stroke="#16a34a" stroke-width="2"/>
    <text x="260" y="245" font-family="sans-serif" font-size="14" font-weight="bold" fill="#16a34a">✓ Terbukti tepat: sisi = 4 cm</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Initial demo data so teacher portal has rich multi-school folders right away
const INITIAL_DEMO_SESSIONS: StudentSession[] = [
  {
    id: 'demo-student-1',
    profile: {
      name: 'Siti Nurhaliza',
      studentNumber: '04',
      grade: 'Kelas VI-A',
      school: 'SD Negeri 1 Merdeka',
      date: new Date().toLocaleDateString('id-ID')
    },
    initialEmotion: {
      emotion: 'semangat',
      label: 'Bersemangat',
      emoji: '🤩',
      notes: 'Siap menaklukkan soal evaluasi bangun datar!',
      timestamp: new Date().toISOString()
    },
    submissions: {
      1: {
        questionId: 1,
        drawingDataUrl: generateSampleCanvas('Persegi 4 Bagian', 'L = 64 cm² dibagi 4 orang'),
        completedAt: new Date(Date.now() - 3600000).toISOString(),
        timeSpentSeconds: 245,
        checkoutEmotion: 'puas',
        rating: 5,
        challengingPart: 'Memahami bahwa luas 16 cm² harus dicari akar kuadratnya untuk dapat panjang sisi.',
        helpfulStrategy: 'Menggambar kotak besar lalu dibagi 4 secara visual di kanvas.',
        keyTakeaway: 'Akar kuadrat dari luas persegi menghasilkan panjang sisinya.',
        teacherFeedback: {
          teacherName: 'Ibu Ratna, S.Pd.',
          notes: 'Penalaran visual dan pembagiannya sangat sistematis. Luar biasa Siti!',
          stamp: 'evaluasi_juara',
          gradedAt: new Date(Date.now() - 1800000).toISOString()
        }
      },
      2: {
        questionId: 2,
        drawingDataUrl: generateSampleCanvas('Taman & Kolam', 'L Taman = 20x9 = 180 m²'),
        completedAt: new Date(Date.now() - 2400000).toISOString(),
        timeSpentSeconds: 310,
        checkoutEmotion: 'bangga',
        rating: 5,
        challengingPart: 'Mengurangkan dua area sekaligus (kolam dan area bermain di sudut).',
        helpfulStrategy: 'Menjumlahkan area kolam + area bermain dulu, baru mengurangi luas taman.',
        keyTakeaway: 'Luas area sisa = Luas total - total luas bangunan di dalamnya.'
      }
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'demo-student-2',
    profile: {
      name: 'Muhammad Rizky Pratama',
      studentNumber: '12',
      grade: 'Kelas VI-A',
      school: 'SD Negeri 1 Merdeka',
      date: new Date().toLocaleDateString('id-ID')
    },
    initialEmotion: {
      emotion: 'penasaran',
      label: 'Penasaran',
      emoji: '🧐',
      timestamp: new Date().toISOString()
    },
    submissions: {
      3: {
        questionId: 3,
        drawingDataUrl: generateSampleCanvas('Perbandingan Segitiga', 'Δ1: 88 cm² vs Δ2: 84 cm²'),
        completedAt: new Date(Date.now() - 1200000).toISOString(),
        timeSpentSeconds: 290,
        checkoutEmotion: 'tertantang',
        rating: 4,
        challengingPart: 'Mengecek pernyataan 3 yang menjebak tentang 2x lipat.',
        helpfulStrategy: 'Menghitung rumus segitiga L = 1/2 x alas x tinggi satu per satu.',
        keyTakeaway: 'Pernyataan harus dihitung detail, jangan langsung menebak.'
      }
    },
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString()
  },
  {
    id: 'demo-student-3',
    profile: {
      name: 'Farah Azzahra Putri',
      studentNumber: '08',
      grade: 'Kelas V-B',
      school: 'SD Bintang Harapan Nusantara',
      date: new Date().toLocaleDateString('id-ID')
    },
    initialEmotion: {
      emotion: 'senang',
      label: 'Senang',
      emoji: '😊',
      timestamp: new Date().toISOString()
    },
    submissions: {
      4: {
        questionId: 4,
        drawingDataUrl: generateSampleCanvas('Evaluasi Lingkaran', 'r=7 -> L=154 | r=14 -> L=616 (4x)'),
        completedAt: new Date(Date.now() - 5000000).toISOString(),
        timeSpentSeconds: 340,
        checkoutEmotion: 'bangga',
        rating: 5,
        challengingPart: 'Membuktikan kenapa luasnya jadi 4 kali lipat padahal jari-jari hanya 2 kali lipat.',
        helpfulStrategy: 'Menghitung manual kedua lingkaran dan membandingkan pembagiannya.',
        keyTakeaway: 'Jari-jari berpangkat dua di rumus luas, jadi pengalinya ikut dikuadratkan!'
      },
      5: {
        questionId: 5,
        drawingDataUrl: generateSampleCanvas('Layang-Layang P & Q', 'P=30 cm², Q=36 cm²'),
        completedAt: new Date(Date.now() - 3000000).toISOString(),
        timeSpentSeconds: 275,
        checkoutEmotion: 'puas',
        rating: 5,
        challengingPart: 'Mengevaluasi efek pembesaran diagonal pendek layang-layang Q.',
        helpfulStrategy: 'Menguji langsung dengan angka baru di rumus 1/2 x d1 x d2.',
        keyTakeaway: 'Rumus layang-layang mirip segitiga bertolak belakang.'
      }
    },
    createdAt: new Date(Date.now() - 80000000).toISOString(),
    updatedAt: new Date(Date.now() - 3000000).toISOString()
  }
];

export function getDefaultProfile(): StudentProfile {
  return {
    name: '',
    studentNumber: '',
    grade: '',
    school: '',
    date: new Date().toISOString().split('T')[0]
  };
}

export function getCurrentSession(): StudentSession {
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean up any old dummy names if present
      if (
        parsed?.profile?.name === 'Siswa Baru' ||
        parsed?.profile?.name === 'Siswa Pintar' ||
        parsed?.profile?.name === 'Siti Nurhaliza'
      ) {
        parsed.profile.name = '';
        parsed.profile.studentNumber = '';
        parsed.profile.grade = '';
        parsed.profile.school = '';
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse current session', err);
  }

  // Create new default active session with empty identity
  const newSession: StudentSession = {
    id: `student-${Date.now()}`,
    profile: getDefaultProfile(),
    initialEmotion: {
      emotion: 'semangat',
      label: 'Bersemangat',
      emoji: '🤩',
      timestamp: new Date().toISOString()
    },
    submissions: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  saveCurrentSession(newSession);
  return newSession;
}

export function saveCurrentSession(session: StudentSession): void {
  try {
    session.updatedAt = new Date().toISOString();
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));

    // Only sync to all sessions if student actually has submitted work
    const submissionCount = Object.keys(session.submissions || {}).length;
    if (submissionCount > 0) {
      const all = getAllSessions();
      const index = all.findIndex((s) => s.id === session.id);
      if (index >= 0) {
        all[index] = session;
      } else {
        all.push(session);
      }
      localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(all));
    }
  } catch (err) {
    console.error('Failed to save current session', err);
  }
}

export function getAllSessions(): StudentSession[] {
  try {
    const raw = localStorage.getItem(ALL_SESSIONS_KEY);
    const hasSeeded = localStorage.getItem(SEEDED_FLAG_KEY);

    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // Only seed once if never initialized before
    if (!hasSeeded) {
      localStorage.setItem(SEEDED_FLAG_KEY, 'true');
      localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(INITIAL_DEMO_SESSIONS));
      return INITIAL_DEMO_SESSIONS;
    }

    return [];
  } catch (err) {
    console.error('Failed to load all sessions', err);
    return [];
  }
}

export function saveTeacherFeedback(
  sessionId: string,
  questionId: number,
  feedback: QuestionSubmission['teacherFeedback']
): boolean {
  try {
    const all = getAllSessions();
    const session = all.find((s) => s.id === sessionId);
    if (!session || !session.submissions[questionId]) {
      return false;
    }
    session.submissions[questionId].teacherFeedback = feedback;
    session.updatedAt = new Date().toISOString();
    localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(all));

    // If current session is the same, sync
    const current = getCurrentSession();
    if (current.id === sessionId && current.submissions[questionId]) {
      current.submissions[questionId].teacherFeedback = feedback;
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(current));
    }
    return true;
  } catch (err) {
    console.error('Failed to save teacher feedback', err);
    return false;
  }
}

// 1. Delete a specific student session
export function deleteStudentSession(sessionId: string): boolean {
  try {
    const all = getAllSessions().filter((s) => s.id !== sessionId);
    localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(all));
    localStorage.setItem(SEEDED_FLAG_KEY, 'true');

    // If current active session is deleted, reinitialize a fresh session without submissions
    const current = getCurrentSession();
    if (current.id === sessionId) {
      current.submissions = {};
      current.id = `student-${Date.now()}`;
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(current));
    }
    return true;
  } catch (err) {
    console.error('Failed to delete student session', err);
    return false;
  }
}

// 2. Delete an entire school folder (all students in that school)
export function deleteSchoolFolder(schoolName: string): boolean {
  try {
    const all = getAllSessions().filter(
      (s) => (s.profile.school.trim() || 'Sekolah Lainnya') !== schoolName
    );
    localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(all));
    localStorage.setItem(SEEDED_FLAG_KEY, 'true');

    // If current session belongs to this school, clear its submissions
    const current = getCurrentSession();
    if ((current.profile.school.trim() || 'Sekolah Lainnya') === schoolName) {
      current.submissions = {};
      current.profile.school = '';
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(current));
    }
    return true;
  } catch (err) {
    console.error('Failed to delete school folder', err);
    return false;
  }
}

// 3. Delete a specific question submission for a student
export function deleteStudentSubmission(sessionId: string, questionId: number): boolean {
  try {
    const all = getAllSessions();
    const target = all.find((s) => s.id === sessionId);
    if (target && target.submissions[questionId]) {
      delete target.submissions[questionId];
      target.updatedAt = new Date().toISOString();
      localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(all));
    }

    const current = getCurrentSession();
    if (current.id === sessionId && current.submissions[questionId]) {
      delete current.submissions[questionId];
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(current));
    }
    return true;
  } catch (err) {
    console.error('Failed to delete student submission', err);
    return false;
  }
}

// 4. Reset all student data
export function clearAllSessions(): boolean {
  try {
    localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify([]));
    localStorage.setItem(SEEDED_FLAG_KEY, 'true');

    const current = getCurrentSession();
    current.submissions = {};
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(current));
    return true;
  } catch (err) {
    console.error('Failed to clear sessions', err);
    return false;
  }
}

export function exportSessionsJSON(): void {
  const all = getAllSessions();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(all, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `rekap-jawaban-siswa-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
