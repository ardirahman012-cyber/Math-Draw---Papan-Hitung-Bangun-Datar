import React, { useState } from 'react';
import { Star, CheckCircle, Award, Sparkles, BookOpen, Brain, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CheckoutEmotionType, QuestionData, QuestionSubmission } from '../types/math';

interface CheckoutReflectionModalProps {
  isOpen: boolean;
  question: QuestionData;
  timeSpentSeconds: number;
  initialData?: QuestionSubmission;
  onSubmit: (data: {
    checkoutEmotion: CheckoutEmotionType;
    rating: number;
    challengingPart: string;
    helpfulStrategy: string;
    keyTakeaway: string;
  }) => void;
  onClose: () => void;
}

const CHECKOUT_EMOTIONS: {
  type: CheckoutEmotionType;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  {
    type: 'puas',
    emoji: '🎉',
    label: 'Puas & Paham',
    desc: 'Bisa menemukan jawaban dan memahami langkahnya dengan mantap!'
  },
  {
    type: 'tertantang',
    emoji: '💪',
    label: 'Mikir Keras',
    desc: 'Soal level C5 cukup menantang otakku untuk mengevaluasi!'
  },
  {
    type: 'bangga',
    emoji: '🌟',
    label: 'Bangga Berusaha',
    desc: 'Mencoba sekuat tenaga dan menyelesaikan setiap langkah coretan.'
  },
  {
    type: 'butuh_latihan',
    emoji: '📖',
    label: 'Perlu Latihan Lagi',
    desc: 'Ingin mengulang lagi agar semakin lancar menghitung luasnya.'
  }
];

export const CheckoutReflectionModal: React.FC<CheckoutReflectionModalProps> = ({
  isOpen,
  question,
  timeSpentSeconds,
  initialData,
  onSubmit,
  onClose
}) => {
  const [checkoutEmotion, setCheckoutEmotion] = useState<CheckoutEmotionType>(
    initialData?.checkoutEmotion || 'puas'
  );
  const [rating, setRating] = useState<number>(initialData?.rating || 5);
  const [challengingPart, setChallengingPart] = useState(
    initialData?.challengingPart || ''
  );
  const [helpfulStrategy, setHelpfulStrategy] = useState(
    initialData?.helpfulStrategy || ''
  );
  const [keyTakeaway, setKeyTakeaway] = useState(
    initialData?.keyTakeaway || ''
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    onSubmit({
      checkoutEmotion,
      rating,
      challengingPart: challengingPart.trim() || 'Menganalisis rumus bangun datar dengan teliti.',
      helpfulStrategy: helpfulStrategy.trim() || 'Menggambar sketsa dan menulis rumus langkah demi langkah.',
      keyTakeaway: keyTakeaway.trim() || 'Evaluasi tingkat tinggi membutuhkan pembuktian matematis.'
    });
  };

  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;
  const timeFormatted = `${minutes > 0 ? `${minutes} menit ` : ''}${seconds} detik`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative my-8 w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl border-4 border-orange-200 text-slate-800">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-300">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Coretan Berhasil Disimpan • Waktu: {timeFormatted}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-orange-950">
              Checkout Emosi &amp; Refleksi Belajar
            </h2>
          </div>
        </div>

        <p className="text-xs text-orange-900/80 mb-5">
          Selamat! Kamu telah menyelesaikan coretan untuk <span className="font-bold text-orange-800">{question.title}</span>. 
          Luangkan waktu sejenak untuk merefleksikan proses berpikirmu sebelum membuka Kunci Jawaban Resmi.
        </p>

        {/* Growth Mindset Callout Card */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200/80 shadow-xs">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-orange-900 italic">
                "{question.affirmation.quote}"
              </p>
              <p className="text-[11px] text-orange-700/80 mt-1">
                {question.affirmation.insight}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Checkout Emotion Selector */}
          <div>
            <label className="block text-xs font-extrabold text-orange-950 mb-2">
              1. Bagaimana perasaanmu setelah mencoret &amp; menghitung soal ini?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CHECKOUT_EMOTIONS.map((item) => {
                const active = checkoutEmotion === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setCheckoutEmotion(item.type)}
                    className={`flex flex-col items-center text-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      active
                        ? 'border-orange-500 bg-orange-100/70 text-orange-950 ring-2 ring-orange-400 scale-[1.02] shadow-sm'
                        : 'border-orange-100 bg-orange-50/20 hover:bg-orange-50/60 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{item.emoji}</span>
                    <span className="text-xs font-bold mb-0.5">{item.label}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Rating Understanding */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-extrabold text-orange-950">
                2. Tingkat kepuasan &amp; keyakinan pemahamanmu:
              </label>
              <span className="text-xs font-bold text-orange-700">
                {rating} dari 5 Bintang
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50/40 rounded-xl border border-orange-200 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 3. Challenging Part */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-orange-950 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>3. Bagian mana yang paling menantang dalam soal ini?</span>
            </label>
            <textarea
              rows={2}
              value={challengingPart}
              onChange={(e) => setChallengingPart(e.target.value)}
              placeholder="Contoh: Saat membuktikan pernyataan nomor 2 yang melibatkan kuadrat jari-jari..."
              className="w-full px-3 py-2 text-xs rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-hidden bg-orange-50/20 resize-none"
            />
          </div>

          {/* 4. Helpful Strategy */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-orange-950 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-orange-600" />
              <span>4. Strategi, rumus, atau sketsa apa yang paling membantumu?</span>
            </label>
            <input
              type="text"
              value={helpfulStrategy}
              onChange={(e) => setHelpfulStrategy(e.target.value)}
              placeholder="Contoh: Membagi luas total dengan 4, lalu mencari akar kuadrat sisinya."
              className="w-full px-3 py-2 text-xs rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-hidden bg-orange-50/20"
            />
          </div>

          {/* 5. Key Takeaway */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-orange-950 mb-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>5. Hal baru apa yang kamu simpulkan dari evaluasi C5 ini?</span>
            </label>
            <input
              type="text"
              value={keyTakeaway}
              onChange={(e) => setKeyTakeaway(e.target.value)}
              placeholder="Contoh: Kita harus menghitung dulu sebelum menyimpulkan kebenaran pernyataan!"
              className="w-full px-3 py-2 text-xs rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-hidden bg-orange-50/20"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Kembali ke Coretan
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md shadow-orange-300/50 transition-all cursor-pointer"
            >
              <span>Simpan Refleksi &amp; Buka Kunci Jawaban</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
