import React, { useState } from 'react';
import { Heart, Sparkles, Smile, ArrowRight } from 'lucide-react';
import { EmotionType, EmotionCheckIn } from '../types/math';

interface EmotionCheckInModalProps {
  isOpen: boolean;
  currentEmotion?: EmotionCheckIn;
  onSelectEmotion: (checkIn: EmotionCheckIn) => void;
  onClose: () => void;
}

const EMOTION_OPTIONS: { type: EmotionType; label: string; emoji: string; desc: string; color: string }[] = [
  {
    type: 'semangat',
    label: 'Bersemangat',
    emoji: '🤩',
    desc: 'Siap menaklukkan tantangan soal evaluasi!',
    color: 'border-orange-400 bg-orange-50 hover:bg-orange-100 text-orange-950'
  },
  {
    type: 'senang',
    label: 'Senang',
    emoji: '😊',
    desc: 'Hari yang ceria untuk belajar bangun datar.',
    color: 'border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-950'
  },
  {
    type: 'penasaran',
    label: 'Penasaran',
    emoji: '🧐',
    desc: 'Ingin tahu cara menyelesaikan soal C5.',
    color: 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100 text-yellow-950'
  },
  {
    type: 'tenang',
    label: 'Tenang & Fokus',
    emoji: '😌',
    desc: 'Rileks dan berkonsentrasi penuh.',
    color: 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-950'
  },
  {
    type: 'cemas',
    label: 'Sedikit Cemas',
    emoji: '🥺',
    desc: 'Takut keliru, tapi aku siap berusaha!',
    color: 'border-rose-400 bg-rose-50 hover:bg-rose-100 text-rose-950'
  },
  {
    type: 'bingung',
    label: 'Agak Bingung',
    emoji: '🤔',
    desc: 'Perlu panduan langkah demi langkah.',
    color: 'border-sky-400 bg-sky-50 hover:bg-sky-100 text-sky-950'
  }
];

export const EmotionCheckInModal: React.FC<EmotionCheckInModalProps> = ({
  isOpen,
  currentEmotion,
  onSelectEmotion,
  onClose
}) => {
  const [selected, setSelected] = useState<EmotionType>(currentEmotion?.emotion || 'semangat');
  const [notes, setNotes] = useState(currentEmotion?.notes || '');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const matched = EMOTION_OPTIONS.find((e) => e.type === selected) || EMOTION_OPTIONS[0];
    onSelectEmotion({
      emotion: matched.type,
      label: matched.label,
      emoji: matched.emoji,
      notes: notes.trim(),
      timestamp: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl border-4 border-orange-200 text-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-300">
            <Heart className="w-6 h-6 fill-orange-500 text-orange-500" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-extrabold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-orange-600" /> Check-in Emosi
            </div>
            <h2 className="text-xl md:text-2xl font-black text-orange-950">
              Bagaimana Perasaanmu Hari Ini?
            </h2>
          </div>
        </div>

        <p className="text-xs text-orange-900/80 mb-5">
          Mengenali emosimu sebelum mulai belajar membantu otakmu lebih siap berpikir kritis dan tidak takut mencoba!
        </p>

        {/* Emotion cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
          {EMOTION_OPTIONS.map((opt) => {
            const isSelected = selected === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setSelected(opt.type)}
                className={`flex flex-col items-center text-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-3 ring-orange-500 shadow-md scale-[1.02] ' + opt.color
                    : 'border-orange-100 bg-orange-50/30 hover:bg-orange-50 text-slate-700'
                }`}
              >
                <span className="text-3xl mb-1.5 transform transition-transform group-hover:scale-110">
                  {opt.emoji}
                </span>
                <span className="text-xs font-bold leading-tight mb-1">{opt.label}</span>
                <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Optional quick note */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-orange-950 mb-1">
            Ceritakan sedikit perasaanmu (opsional):
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Aku ingin buktikan jawaban soal persegi panjang!"
            className="w-full px-3 py-2 rounded-xl border-2 border-orange-200 text-xs focus:border-orange-500 focus:outline-hidden bg-orange-50/20"
          />
        </div>

        {/* Growth mindset reminder */}
        <div className="mb-6 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
          <Smile className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Growth Mindset:</span> Tidak masalah jika merasa ragu. Kesalahan adalah tanda otakmu sedang berkembang mencari solusi terbaik!
          </p>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-md shadow-orange-300/50 transition-all cursor-pointer"
        >
          <span>Siap Mengerjakan Soal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
