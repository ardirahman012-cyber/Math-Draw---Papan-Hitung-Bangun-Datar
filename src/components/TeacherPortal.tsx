import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  User,
  School,
  Lock,
  Unlock,
  Calendar,
  CheckCircle,
  FileCheck,
  Star,
  Sparkles,
  Download,
  Search,
  ArrowLeft,
  X,
  MessageSquare,
  Award,
  Clock,
  Heart,
  Trash2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { StudentSession, QuestionSubmission } from '../types/math';
import { QUESTIONS_DATA } from '../data/questions';
import {
  getAllSessions,
  saveTeacherFeedback,
  deleteStudentSession,
  deleteSchoolFolder,
  deleteStudentSubmission,
  clearAllSessions,
  exportSessionsJSON
} from '../utils/storage';

interface TeacherPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  actionType: 'danger' | 'warning';
  confirmLabel: string;
  onConfirm: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ isOpen, onClose }) => {
  // Simple Teacher PIN Gate (PIN IS NEVER DISPLAYED IN UI)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Data state
  const [sessions, setSessions] = useState<StudentSession[]>(() => getAllSessions());
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeQuestionTab, setActiveQuestionTab] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Teacher feedback form
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackStamp, setFeedbackStamp] = useState<
    'sangat_teliti' | 'kritis_hebat' | 'terus_berlatih' | 'evaluasi_juara'
  >('evaluasi_juara');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Notification feedback
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // In-App Confirmation Modal State (replaces blocked window.confirm)
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    actionType: 'danger',
    confirmLabel: 'Ya, Hapus',
    onConfirm: () => {}
  });

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Group sessions by school
  const schoolFolders = useMemo(() => {
    const map = new Map<string, StudentSession[]>();
    sessions.forEach((s) => {
      const schoolName = s.profile.school.trim() || 'Sekolah Lainnya';
      if (!map.has(schoolName)) {
        map.set(schoolName, []);
      }
      map.get(schoolName)!.push(s);
    });
    return Array.from(map.entries()).map(([school, students]) => ({
      school,
      students,
      totalCompletedSoal: students.reduce(
        (acc, curr) => acc + Object.keys(curr.submissions || {}).length,
        0
      )
    }));
  }, [sessions]);

  // Selected student
  const currentStudent = useMemo(() => {
    return sessions.find((s) => s.id === selectedStudentId);
  }, [sessions, selectedStudentId]);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234 or guru123 or 0000
    if (pinInput === '1234' || pinInput.toLowerCase() === 'guru' || pinInput === '0000') {
      setIsAuthenticated(true);
      setPinError(false);
      setSessions(getAllSessions());
    } else {
      setPinError(true);
    }
  };

  const handleSelectStudent = (student: StudentSession) => {
    setSelectedStudentId(student.id);
    const existingFeedback = student.submissions[activeQuestionTab]?.teacherFeedback;
    if (existingFeedback) {
      setFeedbackNote(existingFeedback.notes);
      setFeedbackStamp(existingFeedback.stamp);
    } else {
      setFeedbackNote('');
      setFeedbackStamp('evaluasi_juara');
    }
  };

  const handleSaveFeedback = () => {
    if (!selectedStudentId) return;
    const feedback: QuestionSubmission['teacherFeedback'] = {
      teacherName: 'Guru Matematika',
      notes: feedbackNote.trim() || 'Pekerjaan sangat baik dan penalaran rapi!',
      stamp: feedbackStamp,
      gradedAt: new Date().toISOString()
    };
    const ok = saveTeacherFeedback(selectedStudentId, activeQuestionTab, feedback);
    if (ok) {
      setFeedbackSuccess(true);
      setSessions(getAllSessions());
      setTimeout(() => setFeedbackSuccess(false), 2500);
    }
  };

  // Prompt delete student (In-app modal)
  const promptDeleteStudent = (sessionId: string, studentName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Siswa',
      message: `Apakah Anda yakin ingin menghapus data siswa "${studentName}"? Seluruh hasil coretan dan refleksinya akan dihapus permanen.`,
      actionType: 'danger',
      confirmLabel: 'Ya, Hapus Siswa',
      onConfirm: () => {
        deleteStudentSession(sessionId);
        if (selectedStudentId === sessionId) {
          setSelectedStudentId(null);
        }
        setSessions(getAllSessions());
        showNotice(`Data siswa "${studentName}" berhasil dihapus.`);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Prompt delete school folder (In-app modal)
  const promptDeleteSchoolFolder = (schoolName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Folder Sekolah',
      message: `PERINGATAN: Apakah Anda yakin ingin menghapus FOLDER SEKOLAH "${schoolName}" beserta seluruh data siswa di dalamnya? Tindakan ini tidak dapat dibatalkan.`,
      actionType: 'danger',
      confirmLabel: 'Ya, Hapus Folder',
      onConfirm: () => {
        deleteSchoolFolder(schoolName);
        if (selectedSchool === schoolName) {
          setSelectedSchool(null);
          setSelectedStudentId(null);
        }
        setSessions(getAllSessions());
        showNotice(`Folder sekolah "${schoolName}" berhasil dihapus.`);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Prompt delete single question submission (In-app modal)
  const promptDeleteQuestionSubmission = (questionId: number) => {
    if (!selectedStudentId) return;
    const qName = QUESTIONS_DATA.find((q) => q.id === questionId)?.title || `Soal ${questionId}`;
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Jawaban Soal',
      message: `Hapus jawaban coretan untuk ${qName}? Siswa dapat mengerjakan dan mencoret ulang soal ini.`,
      actionType: 'warning',
      confirmLabel: 'Ya, Hapus Jawaban Ini',
      onConfirm: () => {
        deleteStudentSubmission(selectedStudentId, questionId);
        setSessions(getAllSessions());
        showNotice(`Jawaban ${qName} berhasil dihapus.`);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Prompt reset all student data (In-app modal)
  const promptClearAllData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Seluruh Data Siswa',
      message: 'PERINGATAN TINGGI: Seluruh folder sekolah dan riwayat pengerjaan semua siswa akan dihapus bersih. Lanjutkan?',
      actionType: 'danger',
      confirmLabel: 'Ya, Hapus Semua Data',
      onConfirm: () => {
        clearAllSessions();
        setSelectedSchool(null);
        setSelectedStudentId(null);
        setSessions([]);
        showNotice('Seluruh data siswa berhasil direset.');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative my-4 w-full max-w-6xl rounded-3xl bg-white p-5 md:p-8 shadow-2xl border-4 border-orange-200 text-slate-800 min-h-[580px] max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-orange-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-300">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[11px] font-extrabold uppercase tracking-wider">
                  Portal Khusus Pendidik
                </span>
                <span className="text-xs text-orange-800 font-semibold">
                  Manajemen Folder Sekolah &amp; Evaluasi Coretan
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-orange-950">
                Ruang Pemeriksaan Jawaban Siswa
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={exportSessionsJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 hover:bg-orange-100 text-xs font-bold transition-all cursor-pointer"
                  title="Unduh Rekap Lengkap Semua Siswa (JSON)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ekspor Data</span>
                </button>

                <button
                  type="button"
                  onClick={promptClearAllData}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-xs font-bold transition-all cursor-pointer"
                  title="Hapus / Reset Seluruh Data Siswa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hapus Semua Data</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-orange-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Notice Banner */}
        {actionNotice && (
          <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>✓ {actionNotice}</span>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Not Authenticated State (PIN IS NEVER DISPLAYED) */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-sm rounded-3xl bg-orange-50/60 p-6 border-2 border-orange-200 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-orange-950 mb-1">
                Akses Terproteksi Guru
              </h3>
              <p className="text-xs text-orange-800/80 mb-5 leading-relaxed">
                Halaman ini khusus untuk bapak/ibu guru memeriksa hasil coretan dan refleksi siswa.
              </p>

              <form onSubmit={handleVerifyPin} className="space-y-3">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Masukkan PIN Guru"
                  className="w-full text-center px-4 py-2.5 rounded-xl border-2 border-orange-300 text-sm font-bold tracking-widest focus:border-orange-500 focus:outline-hidden bg-white"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs font-bold text-red-600">
                    PIN salah. Silakan coba lagi.
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Buka Portal Guru
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col md:flex-row gap-4 mt-4 overflow-hidden">
            {/* Left Column: Folders & Student List */}
            <div className="w-full md:w-80 border-r border-orange-100 pr-2 flex flex-col shrink-0 overflow-y-auto">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-1.5 text-xs text-orange-900 mb-3 bg-orange-50/70 p-2 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSchool(null);
                    setSelectedStudentId(null);
                  }}
                  className="font-bold hover:underline cursor-pointer"
                >
                  Semua Sekolah
                </button>
                {selectedSchool && (
                  <>
                    <span>/</span>
                    <span className="font-bold text-orange-600 truncate max-w-[120px]">
                      {selectedSchool}
                    </span>
                  </>
                )}
              </div>

              {/* View 1: School Folders List */}
              {!selectedSchool && (
                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-orange-950 uppercase tracking-wider mb-2">
                    Folder Berdasarkan Sekolah ({schoolFolders.length})
                  </div>
                  {schoolFolders.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-orange-50/20 rounded-2xl border border-dashed border-orange-200">
                      Belum ada folder sekolah terdaftar.
                    </div>
                  ) : (
                    schoolFolders.map((item) => (
                      <div
                        key={item.school}
                        className="w-full flex items-center justify-between p-3 rounded-2xl border-2 border-orange-200/80 bg-orange-50/30 hover:bg-orange-100/70 hover:border-orange-300 transition-all text-left group"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedSchool(item.school)}
                          className="flex items-center gap-3 flex-1 text-left cursor-pointer min-w-0"
                        >
                          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                            <Folder className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="text-xs font-black text-orange-950 group-hover:text-orange-700 truncate">
                              {item.school}
                            </div>
                            <div className="text-[11px] text-orange-700/80">
                              {item.students.length} Siswa Terdaftar
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-orange-200/80 text-orange-900">
                            {item.totalCompletedSoal} Soal
                          </span>
                          <button
                            type="button"
                            onClick={(e) => promptDeleteSchoolFolder(item.school, e)}
                            title={`Hapus seluruh folder ${item.school}`}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* View 2: Students in Selected School */}
              {selectedSchool && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSchool(null);
                        setSelectedStudentId(null);
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-orange-700 hover:text-orange-900 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali ke Folder</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => promptDeleteSchoolFolder(selectedSchool, e)}
                      className="text-xs text-red-600 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      title="Hapus folder sekolah ini"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Folder</span>
                    </button>
                  </div>

                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-orange-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama siswa..."
                      className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl border border-orange-200 bg-orange-50/20 focus:outline-hidden focus:border-orange-400"
                    />
                  </div>

                  <div className="space-y-1.5 overflow-y-auto pr-1">
                    {(() => {
                      const list = (
                        schoolFolders.find((f) => f.school === selectedSchool)?.students || []
                      ).filter((s) =>
                        s.profile.name.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      if (list.length === 0) {
                        return (
                          <div className="p-4 text-center text-xs text-slate-400 bg-orange-50/20 rounded-xl">
                            Tidak ada siswa di sekolah ini.
                          </div>
                        );
                      }

                      return list.map((stu) => {
                        const isCurrent = stu.id === selectedStudentId;
                        const solvedCount = Object.keys(stu.submissions || {}).length;
                        return (
                          <div
                            key={stu.id}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                              isCurrent
                                ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                                : 'bg-white hover:bg-orange-50/70 border-orange-200/70 text-slate-800'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelectStudent(stu)}
                              className="flex-1 text-left cursor-pointer min-w-0 pr-2"
                            >
                              <div className="text-xs font-extrabold leading-tight truncate">
                                {stu.profile.name}
                              </div>
                              <div
                                className={`text-[10px] leading-tight ${
                                  isCurrent ? 'text-orange-100' : 'text-slate-500'
                                }`}
                              >
                                {stu.profile.grade} • No. Absen {stu.profile.studentNumber}
                              </div>
                            </button>

                            <div className="flex items-center gap-1 shrink-0">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  isCurrent
                                    ? 'bg-orange-700 text-white'
                                    : 'bg-orange-100 text-orange-900'
                                }`}
                              >
                                {solvedCount}/5 Soal
                              </span>
                              <button
                                type="button"
                                onClick={(e) => promptDeleteStudent(stu.id, stu.profile.name, e)}
                                title={`Hapus data siswa ${stu.profile.name}`}
                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                  isCurrent
                                    ? 'text-white/80 hover:text-white hover:bg-orange-600'
                                    : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Detailed Student Work Inspection */}
            <div className="flex-1 overflow-y-auto pl-1 pr-2">
              {!currentStudent ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <div className="w-16 h-16 rounded-3xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-orange-400 mb-3">
                    <FolderOpen className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-extrabold text-orange-950 mb-1">
                    Pilih Siswa untuk Memeriksa
                  </h4>
                  <p className="text-xs text-orange-800/80 max-w-xs">
                    Pilih folder sekolah di sebelah kiri lalu klik nama siswa untuk melihat hasil coretan, refleksi, memberi nilai, atau menghapus data jika diperlukan.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Student Identity Card */}
                  <div className="p-4 rounded-2xl bg-orange-50/60 border-2 border-orange-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-lg shrink-0">
                        {currentStudent.profile.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-orange-950">
                          {currentStudent.profile.name}
                        </h3>
                        <p className="text-xs text-orange-900/80">
                          {currentStudent.profile.school} • {currentStudent.profile.grade} • Absen: {currentStudent.profile.studentNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {currentStudent.initialEmotion && (
                        <div className="px-2.5 py-1 rounded-xl bg-white border border-orange-200 text-orange-950 font-bold flex items-center gap-1.5 shadow-2xs">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          <span>Emosi Awal: {currentStudent.initialEmotion.emoji} {currentStudent.initialEmotion.label}</span>
                        </div>
                      )}
                      <div className="px-2.5 py-1 rounded-xl bg-white border border-orange-200 text-slate-700 flex items-center gap-1 shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        <span>{currentStudent.profile.date}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => promptDeleteStudent(currentStudent.id, currentStudent.profile.name, e)}
                        className="px-2.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Hapus seluruh data siswa ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Siswa</span>
                      </button>
                    </div>
                  </div>

                  {/* Question Tabs (1 - 5) */}
                  <div className="flex flex-wrap items-center gap-1.5 border-b border-orange-200 pb-2">
                    {QUESTIONS_DATA.map((q) => {
                      const isSubmitted = !!currentStudent.submissions[q.id];
                      const isActive = activeQuestionTab === q.id;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => {
                            setActiveQuestionTab(q.id);
                            const exist = currentStudent.submissions[q.id]?.teacherFeedback;
                            if (exist) {
                              setFeedbackNote(exist.notes);
                              setFeedbackStamp(exist.stamp);
                            } else {
                              setFeedbackNote('');
                              setFeedbackStamp('evaluasi_juara');
                            }
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-orange-500 text-white shadow-xs'
                              : isSubmitted
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500 hover:bg-orange-50'
                          }`}
                        >
                          <span>{q.title.split(':')[0]}</span>
                          {isSubmitted ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Question Detail View */}
                  {(() => {
                    const currentQ = QUESTIONS_DATA.find((q) => q.id === activeQuestionTab)!;
                    const submission = currentStudent.submissions[activeQuestionTab];

                    if (!submission) {
                      return (
                        <div className="p-8 text-center bg-orange-50/20 rounded-2xl border border-dashed border-orange-200 text-slate-400 text-xs">
                          Siswa belum menyelesaikan soal {currentQ.title}.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {/* Student Drawing vs Official Answer Key */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Student Drawing */}
                          <div className="p-3 rounded-2xl border-2 border-orange-200 bg-white">
                            <div className="text-xs font-extrabold text-orange-950 uppercase mb-2 flex items-center justify-between">
                              <span>Lembar Coretan Siswa</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500 font-normal">
                                  Waktu: {Math.floor(submission.timeSpentSeconds / 60)}m {submission.timeSpentSeconds % 60}s
                                </span>
                                <button
                                  type="button"
                                  onClick={() => promptDeleteQuestionSubmission(currentQ.id)}
                                  className="text-[10px] text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-md flex items-center gap-1 font-bold border border-red-200 cursor-pointer"
                                  title="Hapus jawaban coretan untuk soal ini"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Hapus Soal Ini</span>
                                </button>
                              </div>
                            </div>
                            <div className="h-64 flex items-center justify-center bg-orange-50/20 rounded-xl overflow-hidden border border-orange-100">
                              <img
                                src={submission.drawingDataUrl}
                                alt="Coretan Siswa"
                                className="max-h-full w-auto object-contain"
                              />
                            </div>
                          </div>

                          {/* Teacher Answer Key */}
                          <div className="p-3 rounded-2xl border-2 border-emerald-200 bg-white">
                            <div className="text-xs font-extrabold text-emerald-950 uppercase mb-2 flex items-center justify-between">
                              <span>Kunci Jawaban Resmi Guru</span>
                              <span className="text-[11px] text-emerald-700 font-bold">
                                {currentQ.level}
                              </span>
                            </div>
                            <div className="h-64 flex items-center justify-center bg-emerald-50/20 rounded-xl overflow-hidden border border-emerald-100">
                              <img
                                src={currentQ.answerKeyImage}
                                alt="Kunci Jawaban Resmi"
                                className="max-h-full w-auto object-contain"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Student Checkout Emotion & Reflection */}
                        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs space-y-2">
                          <div className="flex items-center justify-between border-b border-amber-200/70 pb-2">
                            <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              <span>Hasil Refleksi &amp; Checkout Emosi Siswa:</span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-900 font-bold">
                              <span>Rating Siswa:</span>
                              {[...Array(submission.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
                            <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                              <strong className="text-orange-950 block mb-0.5">Tantangan:</strong>
                              <span className="text-slate-700">{submission.challengingPart}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                              <strong className="text-orange-950 block mb-0.5">Strategi:</strong>
                              <span className="text-slate-700">{submission.helpfulStrategy}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                              <strong className="text-orange-950 block mb-0.5">Pelajaran Penting:</strong>
                              <span className="text-slate-700">{submission.keyTakeaway}</span>
                            </div>
                          </div>
                        </div>

                        {/* Teacher Grading & Feedback Form */}
                        <div className="p-4 rounded-2xl bg-white border-2 border-orange-200 shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4 text-orange-600" />
                              <span>Beri Catatan &amp; Apresiasi Guru</span>
                            </h4>
                            {feedbackSuccess && (
                              <span className="text-xs font-extrabold text-emerald-600 animate-in fade-in">
                                ✓ Catatan berhasil disimpan!
                              </span>
                            )}
                          </div>

                          {/* Stamps Selection */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                              Pilih Stempel Apresiasi:
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                { key: 'evaluasi_juara', label: '🏆 Evaluasi C5 Juara' },
                                { key: 'sangat_teliti', label: '⭐ Sangat Teliti' },
                                { key: 'kritis_hebat', label: '🌟 Kritis Hebat' },
                                { key: 'terus_berlatih', label: '💡 Terus Berlatih' }
                              ].map((st) => (
                                <button
                                  key={st.key}
                                  type="button"
                                  onClick={() => setFeedbackStamp(st.key as any)}
                                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    feedbackStamp === st.key
                                      ? 'bg-orange-100 border-orange-500 text-orange-950 ring-2 ring-orange-300'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-orange-50'
                                  }`}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Feedback text area */}
                          <div>
                            <textarea
                              rows={2}
                              value={feedbackNote}
                              onChange={(e) => setFeedbackNote(e.target.value)}
                              placeholder="Tuliskan umpan balik membangun untuk siswa ini..."
                              className="w-full px-3 py-2 text-xs rounded-xl border border-orange-200 focus:outline-hidden focus:border-orange-500 bg-orange-50/20"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleSaveFeedback}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Simpan Umpan Balik Guru</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* IN-APP CONFIRMATION MODAL (NEVER SUPPRESSED BY IFRAME) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-4 border-red-200 text-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-500">Konfirmasi Tindakan Guru</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mb-6 bg-red-50/60 p-3 rounded-xl border border-red-100">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmModal.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
