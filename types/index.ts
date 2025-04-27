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