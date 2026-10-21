import React, { useState } from 'react';
import { User, School, Calendar, Hash, Award, CheckCircle2, X } from 'lucide-react';
import { StudentProfile } from '../types/math';

interface StudentIdentityModalProps {
  isOpen: boolean;
  profile: StudentProfile;
  onSave: (updated: StudentProfile) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const StudentIdentityModal: React.FC<StudentIdentityModalProps> = ({
  isOpen,
  profile,
  onSave,
  onClose,
  canDismiss = true
}) => {
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setFormData(profile);
    setError(null);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Nama siswa wajib diisi');
      return;
    }
    if (!formData.school.trim()) {
      setError('Asal sekolah wajib diisi agar tersimpan di folder guru');
      return;
    }
    setError(null);
    onSave(formData);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-4 border-orange-200 text-slate-800">
        {canDismiss && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-orange-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-300">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-orange-950">Identitas Siswa</h2>
            <p className="text-xs text-orange-800/80">Lengkapi data diri sebelum mencoret soal</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-orange-950 mb-1">
              Nama Lengkap Siswa *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-orange-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Siti Nurhaliza"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-hidden text-sm bg-orange-50/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-orange-950 mb-1">
                Nomor Absen
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 w-4 h-4 text-orange-400" />
                <input
                  type="text"
                  value={formData.studentNumber}
                  onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                  placeholder="01"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-hidden text-sm bg-orange-50/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-orange-950 mb-1">
                Kelas
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="Kelas VI-A"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-hidden text-sm bg-orange-50/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-orange-950 mb-1">
              Asal Sekolah *
            </label>
            <div className="relative">
              <School className="absolute left-3 top-3 w-4 h-4 text-orange-400" />
              <input
                type="text"
                required
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                placeholder="Contoh: SD Negeri 1 Merdeka"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-hidden text-sm bg-orange-50/30"
              />
            </div>
            <p className="mt-1 text-[11px] text-orange-700/70">
              * Guru akan memeriksa hasil pengerjaanmu di folder sekolah ini.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-orange-950 mb-1">
              Tanggal Pengerjaan
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-orange-400" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-hidden text-sm bg-orange-50/30"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-md shadow-orange-300/50 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Simpan Identitas &amp; Mulai</span>
          </button>
        </form>
      </div>
    </div>
  );
};
