import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pen,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Grid,
  AlignJustify,
  Square,
  Maximize2,
  Minimize2,
  Sparkles,
  Type,
  Plus,
  Stamp,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { ShapeType, StudentProfile } from '../types/math';

interface DrawingCanvasProps {
  initialDataUrl?: string;
  shapeKey: ShapeType;
  studentProfile?: StudentProfile;
  questionTitle?: string;
  onSaveSnapshot: (dataUrl: string) => void;
  disabled?: boolean;
}

type BackgroundPattern = 'ruled_notebook' | 'math_grid' | 'clean_white';

interface Point {
  x: number;
  y: number;
  pressure?: number;
}

const COLOR_PALETTE = [
  { name: 'Hitam Tinta', value: '#18181b' },
  { name: 'Biru Ballpoint', value: '#1d4ed8' },
  { name: 'Merah Koreksi', value: '#dc2626' },
  { name: 'Hijau Botol', value: '#16a34a' },
  { name: 'Oranye Pastel', value: '#ea580c' },
  { name: 'Ungu Matematika', value: '#7c3aed' }
];

const STROKE_WIDTHS = [
  { label: 'Halus (Pensil)', size: 2.2 },
  { label: 'Sedang (Pena)', size: 4.2 },
  { label: 'Tebal (Spidol)', size: 7.5 }
];

const QUICK_MATH_SYMBOLS = [
  '²', '√', '½', 'π', '×', '÷', 'Δ', 'cm²', 'm²', 'L =', 's =', 'p × l'
];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  initialDataUrl,
  shapeKey,
  studentProfile,
  questionTitle,
  onSaveSnapshot,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  
  // Point buffer for smooth spline interpolation
  const pointsRef = useRef<Point[]>([]);

  // Canvas drawing state
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser' | 'text'>('pen');
  const [activeColor, setActiveColor] = useState<string>('#18181b');
  const [strokeWidth, setStrokeWidth] = useState<number>(3.5);
  const [bgPattern, setBgPattern] = useState<BackgroundPattern>('ruled_notebook');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Text insertion state
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Undo / Redo history
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Keep track of current dimensions
  const dimsRef = useRef<{ width: number; height: number }>({ width: 800, height: 650 });

  const updateHistoryButtons = () => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const nextIndex = historyIndexRef.current + 1;
      historyRef.current = historyRef.current.slice(0, nextIndex);
      historyRef.current.push(imageData);

      if (historyRef.current.length > 25) {
        historyRef.current.shift();
      } else {
        historyIndexRef.current = nextIndex;
      }
      updateHistoryButtons();

      const dataUrl = canvas.toDataURL('image/png');
      onSaveSnapshot(dataUrl);
    } catch (e) {
      console.warn('Canvas export warning', e);
    }
  }, [onSaveSnapshot]);

  // Setup canvas with backup preservation
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(Math.floor(rect.width), 340);
    const height = Math.max(Math.floor(rect.height), 620);

    // If already sized properly, skip wiping
    if (
      canvas.width === width * dpr &&
      canvas.height === height * dpr &&
      historyRef.current.length > 0
    ) {
      return;
    }

    // Save previous state to preserve drawing if resizing
    let prevData: ImageData | null = null;
    const oldCtx = canvas.getContext('2d');
    if (oldCtx && canvas.width > 0 && canvas.height > 0) {
      try {
        prevData = oldCtx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (e) {
        // ignore
      }
    }

    dimsRef.current = { width, height };
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (prevData) {
      ctx.putImageData(prevData, 0, 0);
    } else if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        pushHistory();
      };
      img.src = initialDataUrl;
    } else {
      pushHistory();
    }
  }, [initialDataUrl, pushHistory]);

  useEffect(() => {
    setupCanvas();
    const handleResize = () => {
      // Debounce resize
      setTimeout(() => setupCanvas(), 100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  // Smooth Coordinate extraction
  const getCanvasCoords = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // True smooth stroke drawing with midpoint Bezier curves
  const drawSmoothSegment = (p1: Point, p2: Point, p3?: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 4.5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (p3) {
      // Bezier curve through midpoint between p2 and p3
      const mid1X = (p1.x + p2.x) / 2;
      const mid1Y = (p1.y + p2.y) / 2;
      const mid2X = (p2.x + p3.x) / 2;
      const mid2Y = (p2.y + p3.y) / 2;

      ctx.moveTo(mid1X, mid1Y);
      ctx.quadraticCurveTo(p2.x, p2.y, mid2X, mid2Y);
    } else {
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // If text tool is active, place text input at click location
    if (activeTool === 'text') {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setTextInputPos(coords);
      return;
    }

    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;

    const coords = getCanvasCoords(e.clientX, e.clientY);
    pointsRef.current = [coords];

    // Draw single dot on touch/click
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = strokeWidth * 4.5;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = strokeWidth;
      }
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(coords.x + 0.1, coords.y + 0.1);
      ctx.stroke();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || disabled || activeTool === 'text') return;

    // Use coalesced events if available for 120Hz/high-DPI stylus smoothness
    const events: (PointerEvent | React.PointerEvent<HTMLCanvasElement>)[] =
      (e.nativeEvent as any).getCoalescedEvents
        ? (e.nativeEvent as any).getCoalescedEvents()
        : [e];

    for (const ev of events) {
      const point = getCanvasCoords(ev.clientX, ev.clientY);
      pointsRef.current.push(point);

      const len = pointsRef.current.length;
      if (len === 2) {
        drawSmoothSegment(pointsRef.current[0], pointsRef.current[1]);
      } else if (len >= 3) {
        drawSmoothSegment(
          pointsRef.current[len - 3],
          pointsRef.current[len - 2],
          pointsRef.current[len - 1]
        );
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    pointsRef.current = [];
    pushHistory();
  };

  // Stamp text onto canvas
  const handleApplyText = () => {
    if (!textInputPos || !textInputValue.trim()) {
      setTextInputPos(null);
      setTextInputValue('');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = activeColor;
    ctx.font = 'bold 16px "Nunito", sans-serif';
    ctx.fillText(textInputValue, textInputPos.x, textInputPos.y);
    ctx.restore();

    setTextInputPos(null);
    setTextInputValue('');
    pushHistory();
  };

  // Quick Math Symbol appender (stamps at current text or bottom-left)
  const handleQuickSymbol = (sym: string) => {
    if (textInputPos) {
      setTextInputValue((prev) => prev + sym);
      return;
    }

    // Direct stamp on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = dimsRef.current.width;
    const height = dimsRef.current.height;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = activeColor;
    ctx.font = 'bold 20px "Nunito", sans-serif';
    // Draw at a convenient center-right spot or bottom
    ctx.fillText(sym, Math.min(width - 120, 360), 220);
    ctx.restore();
    pushHistory();
  };

  const handleUndo = () => {
    if (historyIndexRef.current <= 0 || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyIndexRef.current -= 1;
    const targetState = historyRef.current[historyIndexRef.current];
    ctx.putImageData(targetState, 0, 0);
    updateHistoryButtons();

    const dataUrl = canvas.toDataURL('image/png');
    onSaveSnapshot(dataUrl);
  };

  const handleRedo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1 || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyIndexRef.current += 1;
    const targetState = historyRef.current[historyIndexRef.current];
    ctx.putImageData(targetState, 0, 0);
    updateHistoryButtons();

    const dataUrl = canvas.toDataURL('image/png');
    onSaveSnapshot(dataUrl);
  };

  const handleClear = () => {
    if (disabled) return;
    setShowClearConfirm(true);
  };

  const executeClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pushHistory();
    setShowClearConfirm(false);
  };

  // FULL WORKSHEET TEMPLATE (Directly matches the teacher's handwritten solution sheet!)
  const handleApplyFullWorksheetTemplate = () => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = dimsRef.current.width;
    const height = dimsRef.current.height;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    // 1. Draw Geometric Shape Sketch according to problem
    if (shapeKey === 'persegi') {
      // Shape 1: Big Square (green fill like photo) -> Arrow -> 4 cut squares
      const sqSize = 100;
      const startX = 40;
      const startY = 40;

      // Original Square
      ctx.fillStyle = '#86efac';
      ctx.fillRect(startX, startY, sqSize, sqSize);
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(startX, startY, sqSize, sqSize);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 13px Nunito, sans-serif';
      ctx.fillText('L = 64 cm²', startX + 10, startY + sqSize + 22);

      // Arrow
      ctx.beginPath();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.moveTo(startX + sqSize + 25, startY + sqSize / 2);
      ctx.lineTo(startX + sqSize + 70, startY + sqSize / 2);
      ctx.lineTo(startX + sqSize + 60, startY + sqSize / 2 - 8);
      ctx.moveTo(startX + sqSize + 70, startY + sqSize / 2);
      ctx.lineTo(startX + sqSize + 60, startY + sqSize / 2 + 8);
      ctx.stroke();

      // Cut 4 Squares
      const cutX = startX + sqSize + 95;
      ctx.fillStyle = '#86efac';
      ctx.fillRect(cutX, startY, sqSize, sqSize);
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(cutX, startY, sqSize, sqSize);

      // 4 quadrant dividing lines
      ctx.beginPath();
      ctx.moveTo(cutX + sqSize / 2, startY);
      ctx.lineTo(cutX + sqSize / 2, startY + sqSize);
      ctx.moveTo(cutX, startY + sqSize / 2);
      ctx.lineTo(cutX + sqSize, startY + sqSize / 2);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.fillText('Dibagi 4 rata (s?)', cutX, startY + sqSize + 22);

      // Section Guides below
      const textStartY = startY + sqSize + 55;
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px Nunito, sans-serif';
      ctx.fillText('Diketahui : Luas (L) = 64 cm² (dibagi 4 orang)', 40, textStartY);
      ctx.fillText('Ditanyakan : sisi (s)?', 40, textStartY + 28);
      ctx.fillText('Jawab :', 40, textStartY + 56);

      // Column guidelines (just like teacher's sheet)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(180, textStartY + 65);
      ctx.lineTo(180, textStartY + 230);
      ctx.moveTo(360, textStartY + 65);
      ctx.lineTo(360, textStartY + 230);
      ctx.stroke();

      // Hints for students to fill
      ctx.fillStyle = '#64748b';
      ctx.font = '13px Nunito, sans-serif';
      ctx.fillText('L = 64 / 4 = ...', 50, textStartY + 95);
      ctx.fillText('L = s²  ->  s = √...', 200, textStartY + 95);
      ctx.fillText('Jadi, panjang sisi potongan: ...', 380, textStartY + 95);

    } else if (shapeKey === 'persegi_panjang') {
      // Shape 2: Park Rectangle with Pool in center and Play Area at corner
      const startX = 40;
      const startY = 35;
      const parkW = 220;
      const parkH = 110;

      // Park (green)
      ctx.fillStyle = '#86efac';
      ctx.fillRect(startX, startY, parkW, parkH);
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(startX, startY, parkW, parkH);

      // Pool (center)
      const poolW = 60;
      const poolH = 45;
      const poolX = startX + 70;
      const poolY = startY + 25;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(poolX, poolY, poolW, poolH);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(poolX, poolY, poolW, poolH);
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillText('Kolam', poolX + 12, poolY + 25);
      ctx.fillText('5m x 4m', poolX + 8, poolY + 38);

      // Play area (bottom right)
      const playW = 65;
      const playH = 45;
      const playX = startX + parkW - playW;
      const playY = startY + parkH - playH;
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(playX, playY, playW, playH);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.strokeRect(playX, playY, playW, playH);
      ctx.fillStyle = '#854d0e';
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillText('Bermain', playX + 10, playY + 20);
      ctx.fillText('L = 24 m²', playX + 8, playY + 35);

      // Labels around park
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.fillText('20 m (Panjang Taman)', startX + 50, startY + parkH + 20);
      ctx.fillText('9 m', startX + parkW + 10, startY + parkH / 2);

      // Section Guides on right
      const rightX = startX + parkW + 60;
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.fillText('Diketahui :', rightX, startY + 20);
      ctx.font = '12px Nunito, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('• pT = 20 m, lT = 9 m', rightX, startY + 40);
      ctx.fillText('• pK = 5 m, lK = 4 m', rightX, startY + 60);
      ctx.fillText('• Luas Area Bermain = 24 m²', rightX, startY + 80);

      // Bottom Area for calculation
      const calcY = startY + parkH + 45;
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('Ditanyakan : Luas sebenarnya area taman yang tersisa?', startX, calcY);
      ctx.fillText('Jawab :', startX, calcY + 28);

      // Dividing lines
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, calcY + 40);
      ctx.lineTo(startX + parkW + 280, calcY + 40);
      ctx.moveTo(startX + 180, calcY + 40);
      ctx.lineTo(startX + 180, calcY + 200);
      ctx.stroke();

    } else if (shapeKey === 'segitiga') {
      // Shape 3: Two Triangles (Green & Cyan) like photo
      const startX = 40;
      const startY = 35;
      const tH = 120;
      const tW1 = 110;

      // Triangle 1 (green)
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(startX + tW1 / 2, startY);
      ctx.lineTo(startX + tW1, startY + tH);
      ctx.lineTo(startX, startY + tH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Altitude line 1
      ctx.beginPath();
      ctx.moveTo(startX + tW1 / 2, startY);
      ctx.lineTo(startX + tW1 / 2, startY + tH);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.fillText('t=11', startX + tW1 / 2 + 5, startY + tH / 2);
      ctx.fillText('alas = 16 cm', startX + 15, startY + tH + 20);

      // Triangle 2 (cyan)
      const t2X = startX + tW1 + 45;
      const tW2 = 100;
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.moveTo(t2X + tW2 / 2, startY);
      ctx.lineTo(t2X + tW2, startY + tH);
      ctx.lineTo(t2X, startY + tH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0e7490';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Altitude line 2
      ctx.beginPath();
      ctx.moveTo(t2X + tW2 / 2, startY);
      ctx.lineTo(t2X + tW2 / 2, startY + tH);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.fillText('t=12', t2X + tW2 / 2 + 5, startY + tH / 2);
      ctx.fillText('alas = 14 cm', t2X + 15, startY + tH + 20);

      // Diketahui on right
      const rightX = t2X + tW2 + 45;
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.fillText('Diketahui :', rightX, startY + 20);
      ctx.font = '12px Nunito, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('• alas Δ1 = 16 cm, tΔ1 = 11 cm', rightX, startY + 45);
      ctx.fillText('• alas Δ2 = 14 cm, tΔ2 = 12 cm', rightX, startY + 70);

      // Perhitungan Luas
      const calcY = startY + tH + 45;
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('Ditanyakan : Tentukan pernyataan yang benar!', startX, calcY);
      ctx.fillText('Jawab :', startX, calcY + 28);

      // Columns
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX + 160, calcY + 35);
      ctx.lineTo(startX + 160, calcY + 200);
      ctx.moveTo(startX + 320, calcY + 35);
      ctx.lineTo(startX + 320, calcY + 200);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '13px Nunito, sans-serif';
      ctx.fillText('Luas Δ1 = ½ × a × t', startX + 10, calcY + 60);
      ctx.fillText('Luas Δ2 = ½ × a × t', startX + 175, calcY + 60);
      ctx.fillText('Evaluasi Pernyataan: 1, 2, 3, 4', startX + 335, calcY + 60);

    } else if (shapeKey === 'lingkaran') {
      // Shape 4: Circle (green) with radius 7 cm like photo
      const startX = 100;
      const startY = 90;
      const radius = 60;

      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Radius line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + radius, startY);
      ctx.stroke();

      // Center point
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(startX, startY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.fillText('7 cm', startX + 18, startY - 8);

      // Right info
      const rightX = startX + radius + 50;
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.fillText('Diketahui : jari-jari (r) = 7 cm', rightX, startY - 20);
      ctx.fillText('Ditanyakan : Pilihlah pernyataan yang benar!', rightX, startY + 8);
      ctx.fillText('Jawab :', rightX, startY + 36);

      // Evaluasi statements guide
      const evalY = startY + radius + 40;
      ctx.font = '13px Nunito, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('• Pernyataan 1 : Luas lingkaran = π × r² = (22/7) × 7 × 7 = ...', 40, evalY);
      ctx.fillText('• Pernyataan 2 : Jika r = 14 cm, L = (22/7) × 14 × 14 = ...', 40, evalY + 32);
      ctx.fillText('• Pernyataan 3 : Jika diameter = 14 cm, r = ...', 40, evalY + 64);
      ctx.fillText('• Pernyataan 4 : Perbandingan luas r=7 dan r=14 = ...', 40, evalY + 96);

    } else if (shapeKey === 'layang_layang') {
      // Shape 5: Kite P and Kite Q like photo
      const startX = 60;
      const startY = 70;

      // Kite P (green)
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(startX, startY - 45);
      ctx.lineTo(startX + 35, startY);
      ctx.lineTo(startX, startY + 55);
      ctx.lineTo(startX - 35, startY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Diagonals P
      ctx.beginPath();
      ctx.moveTo(startX, startY - 45);
      ctx.lineTo(startX, startY + 55);
      ctx.moveTo(startX - 35, startY);
      ctx.lineTo(startX + 35, startY);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.fillText('P (d1=6, d2=10)', startX - 45, startY + 75);

      // Kite Q (cyan)
      const qX = startX + 110;
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.moveTo(qX, startY - 45);
      ctx.lineTo(qX + 40, startY);
      ctx.lineTo(qX, startY + 55);
      ctx.lineTo(qX - 40, startY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0e7490';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Diagonals Q
      ctx.beginPath();
      ctx.moveTo(qX, startY - 45);
      ctx.lineTo(qX, startY + 55);
      ctx.moveTo(qX - 40, startY);
      ctx.lineTo(qX + 40, startY);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.fillText('Q (d1=9, d2=8)', qX - 45, startY + 75);

      // Diketahui on right
      const rightX = qX + 70;
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.fillText('Diketahui :', rightX, startY - 30);
      ctx.font = '12px Nunito, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('• Layang-layang P : d1 = 6 cm, d2 = 10 cm', rightX, startY - 8);
      ctx.fillText('• Layang-layang Q : d1 = 9 cm, d2 = 8 cm', rightX, startY + 14);

      // Evaluasi statements guide
      const evalY = startY + 95;
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('Jawab: Rumus L = ½ × d1 × d2', 40, evalY);
      ctx.font = '13px Nunito, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('L1 = ½ × 10 × 6 = ... cm²', 40, evalY + 28);
      ctx.fillText('L2 = ½ × 9 × 8 = ... cm²', 40, evalY + 56);
      ctx.fillText('Evaluasi Pernyataan 1, 2, 3, 4 ...', 40, evalY + 84);
    }

    ctx.restore();
    pushHistory();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    // Background paper fill
    tCtx.fillStyle = '#fefdfa';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw notebook lines
    if (bgPattern === 'ruled_notebook') {
      tCtx.strokeStyle = '#e8d8c3';
      tCtx.lineWidth = 1;
      const step = 32 * (window.devicePixelRatio || 1);
      for (let y = 40; y < tempCanvas.height; y += step) {
        tCtx.beginPath();
        tCtx.moveTo(0, y);
        tCtx.lineTo(tempCanvas.width, y);
        tCtx.stroke();
      }
    } else if (bgPattern === 'math_grid') {
      tCtx.strokeStyle = '#fed7aa';
      tCtx.lineWidth = 0.8;
      const step = 24 * (window.devicePixelRatio || 1);
      for (let x = 0; x < tempCanvas.width; x += step) {
        tCtx.beginPath();
        tCtx.moveTo(x, 0);
        tCtx.lineTo(x, tempCanvas.height);
        tCtx.stroke();
      }
      for (let y = 0; y < tempCanvas.height; y += step) {
        tCtx.beginPath();
        tCtx.moveTo(0, y);
        tCtx.lineTo(tempCanvas.width, y);
        tCtx.stroke();
      }
    }

    // Draw user layer
    tCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `lembar-jawaban-${shapeKey}-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      className={`relative flex flex-col rounded-3xl border-3 border-orange-300 bg-amber-50/50 shadow-md transition-all duration-300 overflow-hidden ${
        isFullscreen ? 'fixed inset-2 z-50 bg-white/98 p-2 backdrop-blur-md' : 'w-full'
      }`}
    >
      {/* 1. KERTAS LEMBAR JAWABAN SISWA HEADER */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 px-4 py-2.5 text-white flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
            📝
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider">
              KERTAS LEMBAR JAWABAN SISWA (TIPE DRAW)
            </div>
            <div className="text-[11px] text-orange-100 font-semibold">
              Perintah: Gambar bangun datar dan tuliskan langkah perhitungan/rumusmu pada lembar kertas ini!
            </div>
          </div>
        </div>

        {/* Student metadata info strip right on the paper header */}
        {studentProfile?.name?.trim() ? (
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-xl text-[11px] font-bold backdrop-blur-xs">
            <span>👤 {studentProfile.name}</span>
            <span>•</span>
            <span>{studentProfile.grade || 'Kelas VI'}</span>
            <span>•</span>
            <span>Absen: {studentProfile.studentNumber || '-'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl text-[11px] font-bold backdrop-blur-xs text-orange-100">
            <span>⚠️ Belum Mengisi Identitas Siswa</span>
          </div>
        )}
      </div>

      {/* 2. TOOLBAR PENSIL & RUMUS LENGKAP */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-orange-200 bg-orange-100/80 p-2.5">
        {/* Tool switches: Pen, Eraser, Text */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-xs border border-orange-200">
          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTool === 'pen'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-orange-950 hover:bg-orange-50'
            }`}
            title="Pena Coretan Halus"
          >
            <Pen className="w-3.5 h-3.5" />
            <span>Pena</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTool === 'eraser'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-orange-950 hover:bg-orange-50'
            }`}
            title="Penghapus Coretan"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Penghapus</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTool === 'text'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-orange-950 hover:bg-orange-50'
            }`}
            title="Ketik Teks / Rumus di Kertas"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Ketik Teks</span>
          </button>
        </div>

        {/* Color Palette */}
        {activeTool !== 'eraser' && (
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl shadow-xs border border-orange-200">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setActiveColor(c.value)}
                title={c.name}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                  activeColor === c.value
                    ? 'ring-2 ring-orange-500 ring-offset-1 scale-110'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        )}

        {/* Stroke thickness */}
        {activeTool !== 'text' && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-xs border border-orange-200">
            {STROKE_WIDTHS.map((sw) => (
              <button
                key={sw.label}
                type="button"
                onClick={() => setStrokeWidth(sw.size)}
                className={`px-2 py-1 text-xs rounded-md font-semibold transition-all cursor-pointer ${
                  strokeWidth === sw.size
                    ? 'bg-orange-200 text-orange-950 font-bold'
                    : 'text-orange-800 hover:bg-orange-50'
                }`}
              >
                {sw.label.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Paper Background Style */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-xs border border-orange-200">
          <button
            type="button"
            onClick={() => setBgPattern('ruled_notebook')}
            title="Kertas Bergaris Folio (Seperti Kunci Guru)"
            className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              bgPattern === 'ruled_notebook'
                ? 'bg-orange-500 text-white'
                : 'text-orange-900 hover:bg-orange-50'
            }`}
          >
            <AlignJustify className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setBgPattern('math_grid')}
            title="Kertas Kotak Matematika"
            className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              bgPattern === 'math_grid'
                ? 'bg-orange-500 text-white'
                : 'text-orange-900 hover:bg-orange-50'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setBgPattern('clean_white')}
            title="Kertas Putih Polos"
            className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              bgPattern === 'clean_white'
                ? 'bg-orange-500 text-white'
                : 'text-orange-900 hover:bg-orange-50'
            }`}
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Template & History Controls */}
        <div className="flex items-center gap-1.5">
          {/* Apply Full Worksheet Template */}
          <button
            type="button"
            onClick={handleApplyFullWorksheetTemplate}
            title="Otomatis Buat Sketsa Bangun Datar & Format Jawaban"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sketsa Bangun Datar Soal</span>
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo || disabled}
            title="Undo"
            className="p-1.5 rounded-xl bg-white border border-orange-200 text-orange-950 hover:bg-orange-50 disabled:opacity-30 disabled:pointer-events-none shadow-xs cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo || disabled}
            title="Redo"
            className="p-1.5 rounded-xl bg-white border border-orange-200 text-orange-950 hover:bg-orange-50 disabled:opacity-30 disabled:pointer-events-none shadow-xs cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            title="Hapus Bersih"
            className="p-1.5 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 shadow-xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="Download PNG Lembar Ini"
            className="p-1.5 rounded-xl bg-white border border-orange-200 text-orange-900 hover:bg-orange-50 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
            className="p-1.5 rounded-xl bg-white border border-orange-200 text-orange-900 hover:bg-orange-50 shadow-xs cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. SIMBOL RUMUS MATEMATIKA CEPAT (QUICK MATH SYMBOLS STRIP) */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-orange-50/90 border-b border-orange-200/70 text-xs">
        <span className="font-extrabold text-orange-950 text-[11px] mr-1 flex items-center gap-1">
          <Stamp className="w-3.5 h-3.5 text-orange-600" /> Simbol Rumus Cepat:
        </span>
        {QUICK_MATH_SYMBOLS.map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => handleQuickSymbol(sym)}
            className="px-2 py-0.5 rounded-lg bg-white hover:bg-orange-200 border border-orange-200 font-bold text-orange-950 text-xs shadow-2xs transition-all cursor-pointer"
            title={`Tambahkan simbol ${sym}`}
          >
            {sym}
          </button>
        ))}
        <span className="text-[10px] text-orange-800/80 ml-auto hidden md:inline">
          *Gunakan pena untuk menggambar bebas, atau klik tombol Sketsa Bangun Datar di atas!
        </span>
      </div>

      {/* 4. CANVAS DRAWING SURFACE (NOTEBOOK PAPER LOOK & FEEL) */}
      <div
        ref={containerRef}
        className={`relative flex-1 w-full min-h-[580px] md:min-h-[640px] overflow-hidden select-none touch-none ${
          bgPattern === 'ruled_notebook'
            ? 'bg-[linear-gradient(to_bottom,transparent_31px,#ebdcc9_32px)] [background-size:100%_32px] bg-[#fffdf8]'
            : bgPattern === 'math_grid'
            ? 'bg-[radial-gradient(#fdba74_1.2px,transparent_1.2px)] [background-size:20px_20px] bg-[#fffdf8]'
            : 'bg-[#fffdf8]'
        }`}
        style={{ cursor: activeTool === 'text' ? 'text' : 'crosshair' }}
      >
        {/* Red notebook margin on the left for notebook feel */}
        {bgPattern === 'ruled_notebook' && (
          <div className="pointer-events-none absolute left-10 top-0 bottom-0 w-[2px] bg-red-300 opacity-60" />
        )}

        {/* Text Input Overlay if student clicked to type */}
        {textInputPos && (
          <div
            className="absolute z-30 flex items-center gap-1.5 bg-white p-1.5 rounded-xl border-2 border-orange-400 shadow-xl"
            style={{
              left: `${Math.min(textInputPos.x, dimsRef.current.width - 240)}px`,
              top: `${Math.max(textInputPos.y - 45, 10)}px`
            }}
          >
            <input
              type="text"
              autoFocus
              value={textInputValue}
              onChange={(e) => setTextInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyText();
                if (e.key === 'Escape') setTextInputPos(null);
              }}
              placeholder="Tulis rumus / teks..."
              className="px-2 py-1 text-xs font-bold rounded-lg border border-orange-200 focus:outline-hidden w-48 text-slate-800"
            />
            <button
              type="button"
              onClick={handleApplyText}
              className="p-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full block"
        />

        {/* In-app Clear Confirmation Dialog */}
        {showClearConfirm && (
          <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 shadow-2xl border-2 border-orange-300 max-w-sm w-full text-center animate-in fade-in">
              <h4 className="text-sm font-black text-slate-900 mb-1">
                Bersihkan Seluruh Lembar Coretan?
              </h4>
              <p className="text-xs text-slate-600 mb-4">
                Semua coretan, gambar, dan tulisan di kertas ini akan dihapus.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeClear}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xs cursor-pointer"
                >
                  Ya, Bersihkan Kertas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
