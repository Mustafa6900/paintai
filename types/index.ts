// Ortak tip tanımlamaları

export interface Point {
  x: number;
  y: number;
}

export interface DrawingLine {
  points: Point[];
  color: string;
  thickness: number;
  tool: string;
  path?: string;
}

export interface ShapeData {
  id: string;
  type: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  strokeWidth: number;
}

export interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onDismiss: () => void;
}

// Çizim modları
export const DRAW_MODES = {
  PENCIL: 'pencil',
  ERASER: 'eraser',
  SHAPE: 'shape'
};

export const SHAPES = [
  { id: 'rectangle', name: 'Rectangle', icon: '⬜' },
  { id: 'circle', name: 'Circle', icon: '⭕' },
  { id: 'triangle', name: 'Triangle', icon: '🔺' },
  { id: 'line', name: 'Line', icon: '➖' },
  { id: 'arrow', name: 'Arrow', icon: '➡️' },
  { id: 'star', name: 'Star', icon: '⭐' },
  { id: 'heart', name: 'Heart', icon: '❤️' },
  { id: 'ellipse', name: 'Ellipse', icon: '🔵' },
  { id: 'pentagon', name: 'Pentagon', icon: '⬟' },
  { id: 'hexagon', name: 'Hexagon', icon: '⬢' }
];

export const COLORS = [
  '#000000', '#FFFFFF', '#808080', // Black, White, Gray
  '#FF0000', '#FF4500', '#FF6347', // Red shades
  '#FFA500', '#FFD700', '#FFFF00', // Orange and yellow
  '#32CD32', '#00FF00', '#008000', // Green shades
  '#00FFFF', '#00BFFF', '#0000FF', // Blue shades
  '#800080', '#9370DB', '#FF00FF', // Purple shades
  '#FFDAB9', // Peach
  '#A52A2A', '#8B4513', '#CD853F'  // Brown shades
];