import React, { useState, useEffect, useMemo } from 'react';
import {
  Square,
  RectangleHorizontal,
  Triangle,
  Circle,
  Gem,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Award,
  HelpCircle,
  RotateCcw,
  Eye,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { QUESTIONS_DATA } from './data/questions';
import {
  QuestionData,
  StudentSession,
  QuestionSubmission,
  CheckoutEmotionType
} from './types/math';
import {
  getCurrentSession,
  saveCurrentSession,
  getAllSessions
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { DrawingCanvas } from './components/DrawingCanvas';
import { StudentIdentityModal } from './components/StudentIdentityModal';
import { EmotionCheckInModal } from './components/EmotionCheckInModal';
import { CheckoutReflectionModal } from './components/CheckoutReflectionModal';
import { AnswerKeyModal } from './components/AnswerKeyModal';
import { TeacherPortal } from './components/TeacherPortal';

export default function App() {
  // Active session
  const [session, setSession] = useState<StudentSession>(() => getCurrentSession());

  // Navigation state
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Time spent tracker on current active question
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // Temporary canvas snapshot for current question
  const [currentCanvasData, setCurrentCanvasData] = useState<string>('');

  // Modals state
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isEmotionModalOpen, setIsEmotionModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAnswerKeyModalOpen, setIsAnswerKeyModalOpen] = useState(false);
  const [isTeacherPortalOpen, setIsTeacherPortalOpen] = useState(false);

  // Hint toggle in workspace
  const [showHint, setShowHint] = useState(false);

  // Sync session changes to localStorage
  const updateSession = (newSession: StudentSession) => {
    setSession(newSession);
    saveCurrentSession(newSession);
  };

  // Timer for active question
  useEffect(() => {
    if (!selectedQuestionId) {
      setTimeSpent(0);
      return;
    }

    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedQuestionId]);

  // Selected question object
  const activeQuestion = useMemo(() => {
    return QUESTIONS_DATA.find((q) => q.id === selectedQuestionId) || null;
  }, [selectedQuestionId]);

  // Current question submission if exists
  const activeSubmission: QuestionSubmission | undefined = useMemo(() => {
    if (!selectedQuestionId) return undefined;
    return session.submissions[selectedQuestionId];
  }, [session.submissions, selectedQuestionId]);

  // Completed count
  const completedCount = useMemo(() => {
    return Object.keys(session.submissions || {}).length;
  }, [session.submissions]);

  // Check if student identity has been filled
  const hasFilledIdentity = Boolean(
    session.profile.name?.trim() && session.profile.school?.trim()
  );

  // Automatically prompt student identity modal on initial visit if empty
  useEffect(() => {
    if (!hasFilledIdentity) {
      setIsIdentityModalOpen(true);
    }
  }, []);

  // Handle selecting a question from the menu
  const handleSelectQuestion = (qId: number) => {
    if (!session.profile.name?.trim() || !session.profile.school?.trim()) {
      setIsIdentityModalOpen(true);
      return;
    }
    setSelectedQuestionId(qId);
    setShowHint(false);
    setTimeSpent(session.submissions[qId]?.timeSpentSeconds || 0);
    setCurrentCanvasData(session.submissions[qId]?.drawingDataUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Finish problem -> Open Checkout Emotion & Reflection
  const handleFinishQuestion = () => {
    setIsCheckoutModalOpen(true);
  };

  // Submit Reflection & Checkout -> Save and open Answer Key
  const handleCheckoutSubmit = (data: {
    checkoutEmotion: CheckoutEmotionType;
    rating: number;
    challengingPart: string;
    helpfulStrategy: string;
    keyTakeaway: string;
  }) => {
    if (!selectedQuestionId) return;

    const newSubmission: QuestionSubmission = {
      questionId: selectedQuestionId,
      drawingDataUrl: currentCanvasData || activeSubmission?.drawingDataUrl || '',
      completedAt: new Date().toISOString(),
      timeSpentSeconds: timeSpent,
      checkoutEmotion: data.checkoutEmotion,
      rating: data.rating,
      challengingPart: data.challengingPart,
      helpfulStrategy: data.helpfulStrategy,
      keyTakeaway: data.keyTakeaway,
      teacherFeedback: activeSubmission?.teacherFeedback
    };

    const updatedSession: StudentSession = {
      ...session,
      submissions: {
        ...session.submissions,
        [selectedQuestionId]: newSubmission
      }
    };

    updateSession(updatedSession);
    setIsCheckoutModalOpen(false);
    setIsAnswerKeyModalOpen(true);
  };

  // Shape icon helper
  const getShapeIcon = (shapeKey: string, className = 'w-6 h-6') => {
    switch (shapeKey) {
      case 'persegi':
        return <Square className={className} />;
      case 'persegi_panjang':
        return <RectangleHorizontal className={className} />;
      case 'segitiga':
        return <Triangle className={className} />;
      case 'lingkaran':
        return <Circle className={className} />;
      case 'layang_layang':
        return <Gem className={className} />;
      default:
        return <Square className={className} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f5] flex flex-col text-slate-800">
      {/* Top Navbar */}
      <Navbar
        profile={session.profile}
        initialEmotion={session.initialEmotion}
        completedCount={completedCount}
        totalQuestions={QUESTIONS_DATA.length}
        onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
        onOpenEmotionModal={() => setIsEmotionModalOpen(true)}
        onOpenTeacherPortal={() => setIsTeacherPortalOpen(true)}
        onGoHome={() => setSelectedQuestionId(null)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ============================================================
            VIEW 1: MENU UTAMA KATALOG SOAL BANGUN DATAR (PILIH SENDIRI)
           ============================================================ */}
        {!selectedQuestionId ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 p-6 md:p-10 text-white shadow-xl shadow-orange-500/15">
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-12 -top-12 w-48 h-48 bg-amber-300/20 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black tracking-wider uppercase mb-3 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  Papan Hitung &amp; Coret Siswa (Level C5-Evaluasi)
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
                  {session.profile.name?.trim()
                    ? `Selamat Datang, ${session.profile.name}!`
                    : 'Selamat Datang di MathDraw!'}
                </h1>

                <p className="text-sm sm:text-base text-orange-50/95 leading-relaxed mb-6 font-medium">
                  {session.profile.name?.trim()
                    ? 'Setiap soal dikerjakan langsung dengan mencoret dan menggambar di kanvas papan tulis. Pilihlah bangun datar yang ingin kamu evaluasi terlebih dahulu! Kunci jawaban asli guru akan terbuka setelah kamu selesai mencoret dan mengisi refleksi.'
                    : 'Halo siswa hebat! Silakan masukkan identitasmu (nama, nomor absen, kelas, dan asal sekolah) terlebih dahulu agar lembar kerja coretanmu dapat disimpan dan diperiksa oleh guru.'}
                </p>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsIdentityModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {session.profile.school?.trim()
                        ? `🏫 Sekolah: ${session.profile.school}`
                        : '📝 Klik untuk Isi Identitas Siswa (Wajib)'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEmotionModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{session.initialEmotion?.emoji} Perasaan: {session.initialEmotion?.label}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Growth Mindset Strip */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                    Afirmasi Pemikiran Tingkat Tinggi (C5)
                  </div>
                  <div className="text-xs text-amber-900/90 font-medium">
                    "Tantangan evaluasi bukan soal benar atau salah dengan cepat, melainkan keberanian membuktikan kebenaran melalui langkah nyata!"
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs font-black text-amber-950 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200">
                <span>{completedCount} dari 5 Selesai</span>
              </div>
            </div>

            {/* Question Catalog Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-orange-950">
                    Katalog Menu Soal Uraian (Tipe Draw)
                  </h2>
                  <p className="text-xs text-orange-800/80">
                    Klik soal bangun datar mana pun yang ingin kamu selesaikan:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {QUESTIONS_DATA.map((q) => {
                  const submission = session.submissions[q.id];
                  const isDone = !!submission;

                  return (
                    <div
                      key={q.id}
                      className={`group relative flex flex-col justify-between rounded-3xl p-5 border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                        isDone
                          ? 'bg-gradient-to-b from-emerald-50/60 to-white border-emerald-300 shadow-emerald-500/5'
                          : 'bg-white border-orange-200 hover:border-orange-400 shadow-orange-500/5'
                      }`}
                    >
                      <div>
                        {/* Top Shape & Status Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white'
                            }`}
                          >
                            {getShapeIcon(q.shapeKey, 'w-6 h-6')}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isDone ? (
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selesai
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-[11px] font-extrabold">
                                Siap Dikerjakan
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question Titles */}
                        <div className="mb-2">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600">
                            {q.level}
                          </span>
                          <h3 className="text-lg font-black text-orange-950 group-hover:text-orange-600 transition-colors">
                            {q.title}
                          </h3>
                          <p className="text-xs font-semibold text-orange-800/80">
                            {q.subtitle}
                          </p>
                        </div>

                        {/* Story preview snippet */}
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 bg-orange-50/30 p-2.5 rounded-xl border border-orange-100/70">
                          {q.story}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-orange-100/80 space-y-2">
                        {isDone && (
                          <div className="flex items-center justify-between text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-emerald-200">
                            <span className="font-bold text-emerald-800">
                              Refleksi: {submission.checkoutEmotion} ({submission.rating}★)
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedQuestionId(q.id);
                                setIsAnswerKeyModalOpen(true);
                              }}
                              className="text-emerald-700 font-extrabold hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> Kunci
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSelectQuestion(q.id)}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-xs shadow-md transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-300/40'
                          }`}
                        >
                          <span>{isDone ? 'Buka Kembali / Gambar Ulang' : 'Buka Papan Coret Soal Ini'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================
             VIEW 2: WORKSPACE PENGERJAAN SOAL (CANVAS DRAW AREA)
             ============================================================ */
          activeQuestion && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Workspace Top Navigation & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-orange-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedQuestionId(null)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-orange-100 text-orange-950 hover:bg-orange-200 text-xs font-extrabold transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Menu Soal</span>
                  </button>

                  <div className="hidden sm:block h-6 w-px bg-orange-200" />

                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                      {getShapeIcon(activeQuestion.shapeKey, 'w-5 h-5')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-orange-950">
                          {activeQuestion.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-extrabold">
                          {activeQuestion.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-orange-800/80 font-semibold">
                        {activeQuestion.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Workspace Bar: Timer & Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-950">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>
                      {Math.floor(timeSpent / 60)}:
                      {String(timeSpent % 60).padStart(2, '0')}
                    </span>
                  </div>

                  {activeSubmission && (
                    <button
                      type="button"
                      onClick={() => setIsAnswerKeyModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-extrabold hover:bg-emerald-100 transition-all cursor-pointer"
                      title="Lihat Kunci Jawaban Resmi"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kunci Jawaban</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Problem Prompt Box */}
              <div className="rounded-3xl border-2 border-orange-200 bg-white p-5 md:p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-black uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5 text-orange-600" /> Teks Soal Cerita
                    </div>
                    <p className="text-sm md:text-base font-bold text-slate-800 leading-relaxed whitespace-pre-line">
                      {activeQuestion.story}
                    </p>
                  </div>
                </div>

                {/* Hint & C5 Thinking Strategy Toggle */}
                <div className="border-t border-orange-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-orange-700 hover:text-orange-900 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>
                      {showHint ? 'Tutup Panduan Berpikir' : 'Buka Tips & Panduan Berpikir C5'}
                    </span>
                  </button>

                  {showHint && (
                    <div className="mt-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5 animate-in fade-in">
                      <p className="font-bold flex items-center gap-1.5 text-amber-900">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Panduan Evaluasi Matematika:
                      </p>
                      <p className="leading-relaxed">{activeQuestion.hintText}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawing Canvas Board */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-orange-950">
                      Papan Coretan &amp; Gambar Siswa (Draw Canvas)
                    </h3>
                  </div>
                  <span className="text-xs text-orange-800/80 font-bold hidden sm:inline">
                    Gunakan jari / stylus / mouse untuk menggambar bangun datar &amp; rumus
                  </span>
                </div>

                <DrawingCanvas
                  initialDataUrl={activeSubmission?.drawingDataUrl}
                  shapeKey={activeQuestion.shapeKey}
                  studentProfile={session.profile}
                  questionTitle={activeQuestion.title}
                  onSaveSnapshot={(dataUrl) => setCurrentCanvasData(dataUrl)}
                />
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-orange-300 shadow-xl">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQuestionId(null)}
                    className="px-4 py-2.5 rounded-2xl bg-orange-100 text-orange-950 hover:bg-orange-200 text-xs font-bold transition-all"
                  >
                    Simpan Nanti &amp; Kembali ke Menu
                  </button>

                  {activeSubmission && (
                    <button
                      type="button"
                      onClick={() => setIsAnswerKeyModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-100 text-emerald-950 hover:bg-emerald-200 text-xs font-extrabold transition-all"
                    >
                      <Eye className="w-4 h-4 text-emerald-700" />
                      <span>Kunci Jawaban Guru</span>
                    </button>
                  )}
                </div>

                {/* Primary Finish Button */}
                <button
                  type="button"
                  onClick={handleFinishQuestion}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-300/50 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Selesai Mengerjakan Soal Ini</span>
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-orange-200 bg-white/60 py-6 text-center text-xs text-orange-800/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-semibold">
          <p>
            MathDraw • Media Pembelajaran Matematika Interaktif Bangun Datar Level C5-Evaluasi
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTeacherPortalOpen(true)}
              className="text-orange-900 font-extrabold hover:underline"
            >
              Akses Guru (Folder Sekolah)
            </button>
          </div>
        </div>
      </footer>

      {/* ============================================================
          MODALS
         ============================================================ */}

      {/* 1. Student Identity Modal */}
      <StudentIdentityModal
        isOpen={isIdentityModalOpen}
        profile={session.profile}
        onSave={(updated) => {
          updateSession({ ...session, profile: updated });
          setIsIdentityModalOpen(false);
        }}
        onClose={() => {
          if (hasFilledIdentity) setIsIdentityModalOpen(false);
        }}
        canDismiss={hasFilledIdentity}
      />

      {/* 2. Emotion Check-in Modal */}
      <EmotionCheckInModal
        isOpen={isEmotionModalOpen}
        currentEmotion={session.initialEmotion}
        onSelectEmotion={(checkIn) => {
          updateSession({ ...session, initialEmotion: checkIn });
          setIsEmotionModalOpen(false);
        }}
        onClose={() => setIsEmotionModalOpen(false)}
      />

      {/* 3. Checkout Emotion & Reflection Modal (Unified) */}
      {activeQuestion && (
        <CheckoutReflectionModal
          isOpen={isCheckoutModalOpen}
          question={activeQuestion}
          timeSpentSeconds={timeSpent}
          initialData={activeSubmission}
          onSubmit={handleCheckoutSubmit}
          onClose={() => setIsCheckoutModalOpen(false)}
        />
      )}

      {/* 4. Official Answer Key Modal with original teacher image & comparison */}
      {activeQuestion && (
        <AnswerKeyModal
          isOpen={isAnswerKeyModalOpen}
          question={activeQuestion}
          submission={activeSubmission}
          onNextQuestion={
            activeQuestion.id < QUESTIONS_DATA.length
              ? () => {
                  setIsAnswerKeyModalOpen(false);
                  handleSelectQuestion(activeQuestion.id + 1);
                }
              : undefined
          }
          onBackToMenu={() => {
            setIsAnswerKeyModalOpen(false);
            setSelectedQuestionId(null);
          }}
          onClose={() => setIsAnswerKeyModalOpen(false)}
        />
      )}

      {/* 5. Teacher Portal Modal (PIN protected, folder by school) */}
      <TeacherPortal
        isOpen={isTeacherPortalOpen}
        onClose={() => {
          setIsTeacherPortalOpen(false);
          setSession(getCurrentSession());
        }}
      />
    </div>
  );
}
