import React from 'react';
import {
  Shapes,
  User,
  Heart,
  School,
  Lock,
  Sparkles,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { StudentProfile, EmotionCheckIn } from '../types/math';

interface NavbarProps {
  profile: StudentProfile;
  initialEmotion?: EmotionCheckIn;
  completedCount: number;
  totalQuestions: number;
  onOpenIdentityModal: () => void;
  onOpenEmotionModal: () => void;
  onOpenTeacherPortal: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  initialEmotion,
  completedCount,
  totalQuestions,
  onOpenIdentityModal,
  onOpenEmotionModal,
  onOpenTeacherPortal,
  onGoHome
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-orange-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-3 group text-left cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-300/40 group-hover:scale-105 transition-transform">
            <Shapes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-orange-950 font-handwriting text-2xl">
                MathDraw
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-800 tracking-wider">
                C5-Evaluasi
              </span>
            </div>
            <p className="text-[11px] text-orange-800/80 font-bold hidden sm:block">
              Papan Coret Bangun Datar &amp; Refleksi
            </p>
          </div>
        </button>

        {/* Center: Student Info Pill & Emotion */}
        <div className="flex items-center gap-2">
          {/* Student Profile Button */}
          <button
            type="button"
            onClick={onOpenIdentityModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              profile.name?.trim()
                ? 'bg-orange-50/80 hover:bg-orange-100 border-orange-200 text-orange-950'
                : 'bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-950 ring-2 ring-amber-300'
            }`}
            title="Klik untuk mengisi / mengubah identitas siswa"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
              profile.name?.trim() ? 'bg-orange-200 text-orange-800' : 'bg-amber-500 text-white'
            }`}>
              {profile.name?.trim() ? profile.name.trim().charAt(0) : '?'}
            </div>
            <div className="text-left hidden md:block">
              <div className="leading-tight text-xs font-black truncate max-w-[130px]">
                {profile.name?.trim() || 'Isi Identitas Siswa'}
              </div>
              <div className="leading-tight text-[10px] text-orange-700/80 truncate max-w-[130px]">
                {profile.school?.trim() || 'Klik untuk Masukkan Data Diri'}
              </div>
            </div>
          </button>

          {/* Emotion Pill */}
          {initialEmotion && (
            <button
              type="button"
              onClick={onOpenEmotionModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-950 transition-all shadow-2xs cursor-pointer"
              title="Perasaan awalmu hari ini"
            >
              <span>{initialEmotion.emoji}</span>
              <span className="text-[11px]">{initialEmotion.label}</span>
            </button>
          )}

          {/* Progress Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {completedCount}/{totalQuestions} Selesai
            </span>
          </div>
        </div>

        {/* Right Action: Teacher Portal Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTeacherPortal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            title="Khusus Bapak/Ibu Guru untuk memeriksa jawaban berdasarkan folder sekolah"
          >
            <Lock className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Portal Guru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
