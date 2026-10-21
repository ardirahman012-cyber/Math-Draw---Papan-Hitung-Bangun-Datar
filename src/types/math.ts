export type ShapeType = 'persegi' | 'persegi_panjang' | 'segitiga' | 'lingkaran' | 'layang_layang';

export interface QuestionStatement {
  id: number;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuestionData {
  id: number;
  shapeKey: ShapeType;
  title: string;
  subtitle: string;
  level: string; // e.g. "C5 - Evaluasi"
  story: string;
  statements?: QuestionStatement[];
  questionPrompt: string;
  answerKeyImage: string;
  solutionBreakdown: {
    diketahui: string[];
    ditanyakan: string;
    langkahPengerjaan: {
      judul: string;
      rumus: string;
      perhitungan: string[];
      hasil: string;
    }[];
    evaluasiPernyataan?: {
      pernyataanId: number;
      status: 'Benar' | 'Salah';
      penjelasan: string;
    }[];
    kesimpulan: string;
  };
  affirmation: {
    quote: string;
    author: string;
    insight: string;
  };
  hintText: string;
}

export interface StudentProfile {
  name: string;
  studentNumber: string; // Absen
  grade: string; // Kelas
  school: string; // Asal Sekolah
  date: string; // Tanggal
}

export type EmotionType = 
  | 'senang' 
  | 'semangat' 
  | 'penasaran' 
  | 'tenang' 
  | 'cemas' 
  | 'bingung';

export interface EmotionCheckIn {
  emotion: EmotionType;
  label: string;
  emoji: string;
  notes?: string;
  timestamp: string;
}

export type CheckoutEmotionType = 
  | 'puas' 
  | 'tertantang' 
  | 'bangga' 
  | 'butuh_latihan';

export interface QuestionSubmission {
  questionId: number;
  drawingDataUrl: string;
  completedAt: string;
  timeSpentSeconds: number;
  checkoutEmotion: CheckoutEmotionType;
  rating: number; // 1 to 5 stars
  challengingPart: string;
  helpfulStrategy: string;
  keyTakeaway: string;
  teacherFeedback?: {
    teacherName: string;
    notes: string;
    stamp: 'sangat_teliti' | 'kritis_hebat' | 'terus_berlatih' | 'evaluasi_juara';
    gradedAt: string;
  };
}

export interface StudentSession {
  id: string;
  profile: StudentProfile;
  initialEmotion?: EmotionCheckIn;
  submissions: Record<number, QuestionSubmission>; // key is question id (1..5)
  createdAt: string;
  updatedAt: string;
}
