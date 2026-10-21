import React, { useState } from 'react';
import {
  CheckCircle2,
  Columns,
  Eye,
  Sparkles,
  ArrowRight,
  Maximize2,
  FileText,
  Image as ImageIcon,
  Check,
  X as CloseIcon,
  HelpCircle
} from 'lucide-react';
import { QuestionData, QuestionSubmission } from '../types/math';

interface AnswerKeyModalProps {
  isOpen: boolean;
  question: QuestionData;
  submission?: QuestionSubmission;
  onNextQuestion?: () => void;
  onBackToMenu: () => void;
  onClose: () => void;
}

export const AnswerKeyModal: React.FC<AnswerKeyModalProps> = ({
  isOpen,
  question,
  submission,
  onNextQuestion,
  onBackToMenu,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<'compare' | 'key_only' | 'student_only'>('compare');
  const [isZoomImage, setIsZoomImage] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative my-4 w-full max-w-5xl rounded-3xl bg-white p-5 md:p-8 shadow-2xl border-4 border-orange-200 text-slate-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-300">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider">
                  Kunci Jawaban Resmi
                </span>
                <span className="text-xs text-orange-700 font-semibold">
                  {question.level}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-orange-950">
                {question.title} : {question.subtitle}
              </h2>
            </div>
          </div>

          {/* View mode toggle buttons */}
          <div className="flex items-center gap-1.5 bg-orange-50 p-1 rounded-2xl border border-orange-200">
            <button
              type="button"
              onClick={() => setViewMode('compare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'compare'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-orange-900 hover:bg-orange-100'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Bandingkan Berdampingan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('key_only')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'key_only'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-orange-900 hover:bg-orange-100'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Kunci Asli Guru</span>
            </button>
            {submission?.drawingDataUrl && (
              <button
                type="button"
                onClick={() => setViewMode('student_only')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'student_only'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-orange-900 hover:bg-orange-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Coretan Saya</span>
              </button>
            )}
          </div>
        </div>

        {/* Growth affirmation strip */}
        <div className="my-3 px-4 py-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong className="font-bold">Kekuatan Growth Mindset:</strong> Evaluasi mandiri bukan tentang mencari siapa salah, tetapi melatih ketelitian pembuktian matematika!
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 min-h-[300px]">
          {/* Visual Comparison Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Drawing */}
            {(viewMode === 'compare' || viewMode === 'student_only') && (
              <div className="flex flex-col rounded-2xl border-2 border-orange-200 bg-orange-50/30 p-3 shadow-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-orange-200/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-orange-950">
                      Coretan Jawaban Kamu
                    </h3>
                  </div>
                  {submission && (
                    <span className="text-[11px] font-semibold text-orange-800">
                      Refleksi: {submission.checkoutEmotion} ({submission.rating}★)
                    </span>
                  )}
                </div>

                <div className="relative flex-1 min-h-[300px] flex items-center justify-center bg-white rounded-xl border border-orange-200/80 overflow-hidden p-2">
                  {submission?.drawingDataUrl ? (
                    <img
                      src={submission.drawingDataUrl}
                      alt="Coretan Siswa"
                      className="max-h-[360px] w-auto object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-400 text-xs">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Belum ada coretan kanvas yang tersimpan.
                    </div>
                  )}
                </div>

                {submission?.challengingPart && (
                  <div className="mt-2 text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl border border-orange-100">
                    <span className="font-bold text-orange-900">Catatan Refleksimu: </span>
                    {submission.challengingPart}
                  </div>
                )}
              </div>
            )}

            {/* Official Answer Key Image */}
            {(viewMode === 'compare' || viewMode === 'key_only') && (
              <div
                className={`flex flex-col rounded-2xl border-2 border-emerald-300 bg-emerald-50/30 p-3 shadow-xs ${
                  viewMode === 'key_only' ? 'md:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-emerald-200/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                      Gambar Kunci Jawaban Asli Guru
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsZoomImage(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-2xs"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Perbesar Gambar</span>
                  </button>
                </div>

                <div
                  onClick={() => setIsZoomImage(true)}
                  className="relative flex-1 min-h-[300px] flex items-center justify-center bg-white rounded-xl border border-emerald-200/80 overflow-hidden p-2 cursor-pointer group"
                >
                  <img
                    src={question.answerKeyImage}
                    alt={`Kunci Jawaban ${question.title}`}
                    className="max-h-[360px] w-auto object-contain rounded-lg transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover:opacity-100 bg-emerald-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-xs transition-opacity shadow-lg">
                      Klik untuk Memperbesar
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-emerald-900 bg-white/80 p-2 rounded-xl border border-emerald-200">
                  <span className="font-bold">Tips Cek: </span>
                  Perhatikan kesesuaian rumus, substitusi angka, dan kesimpulan akhir.
                </div>
              </div>
            )}
          </div>

          {/* Detailed Step-by-Step Text Breakdown */}
          <div className="rounded-2xl border-2 border-orange-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-orange-100">
              <FileText className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-extrabold text-orange-950 uppercase tracking-wider">
                Pembahasan Langkah Demi Langkah (Evaluasi C5)
              </h3>
            </div>

            {/* Diketahui & Ditanya */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-orange-50/50 p-3.5 rounded-xl border border-orange-100">
                <span className="text-xs font-extrabold text-orange-900 uppercase">
                  Diketahui:
                </span>
                <ul className="mt-1 text-xs text-slate-700 space-y-1 list-disc list-inside">
                  {question.solutionBreakdown.diketahui.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50/50 p-3.5 rounded-xl border border-orange-100">
                <span className="text-xs font-extrabold text-orange-900 uppercase">
                  Ditanyakan:
                </span>
                <p className="mt-1 text-xs text-slate-700 font-medium">
                  {question.solutionBreakdown.ditanyakan}
                </p>
              </div>
            </div>

            {/* Langkah Pengerjaan */}
            <div className="space-y-3 mb-4">
              <span className="text-xs font-extrabold text-orange-900 uppercase block">
                Langkah Perhitungan Rumus:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.solutionBreakdown.langkahPengerjaan.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-orange-50/30 border border-orange-200"
                  >
                    <div className="text-xs font-bold text-orange-950 mb-1">
                      {step.judul}
                    </div>
                    <div className="text-[11px] font-mono text-orange-800 bg-white px-2 py-1 rounded-md border border-orange-200 mb-2">
                      {step.rumus}
                    </div>
                    <div className="space-y-0.5 text-xs text-slate-700 font-mono">
                      {step.perhitungan.map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Hasil: {step.hasil}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluasi Pernyataan jika ada */}
            {question.solutionBreakdown.evaluasiPernyataan && (
              <div className="mb-4">
                <span className="text-xs font-extrabold text-orange-900 uppercase block mb-2">
                  Evaluasi Kebenaran Tiap Pernyataan:
                </span>
                <div className="space-y-2">
                  {question.solutionBreakdown.evaluasiPernyataan.map((ev) => (
                    <div
                      key={ev.pernyataanId}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                        ev.status === 'Benar'
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/60 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white ${
                          ev.status === 'Benar' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      >
                        {ev.status === 'Benar' ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <CloseIcon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold">
                          Pernyataan {ev.pernyataanId} : Status {ev.status}
                        </div>
                        <div className="text-slate-700 mt-0.5">{ev.penjelasan}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Kesimpulan Akhir */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-2 border-orange-300">
              <span className="text-xs font-extrabold text-orange-950 uppercase block mb-1">
                Kesimpulan Akhir:
              </span>
              <p className="text-xs md:text-sm font-bold text-orange-950">
                {question.solutionBreakdown.kesimpulan}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-orange-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Tutup Kunci
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToMenu}
              className="px-4 py-2.5 rounded-xl bg-orange-100 text-orange-900 hover:bg-orange-200 text-xs font-bold transition-all"
            >
              Pilih Bangun Datar Lain
            </button>
            {onNextQuestion && (
              <button
                type="button"
                onClick={onNextQuestion}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-300/40 transition-all cursor-pointer"
              >
                <span>Soal Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* High-res Image Zoom Modal */}
      {isZoomImage && (
        <div
          onClick={() => setIsZoomImage(false)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-zoom-out animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white p-4 rounded-2xl shadow-2xl">
            <button
              type="button"
              onClick={() => setIsZoomImage(false)}
              className="absolute top-2 right-2 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-900"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
            <img
              src={question.answerKeyImage}
              alt="Zoom Kunci Jawaban"
              className="max-h-[82vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
