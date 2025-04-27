import { t } from '@/locales';

// Common type definitions

export interface ToolBarProps {
  onUndo: () => void;
  onToggleTool: (isPencil: boolean, size?: number) => void;
  currentDrawMode: string;
  setCurrentDrawMode: (mode: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  colors: string[];
  brushSize: number;
  visible: boolean;
  selectedShape: string | null;
  setSelectedShape: (shape: string | null) => void;
  onSave: () => void;
  onShare: () => void;
  onClear: () => void;
  onAddImage: () => void;
  onApplyAIStyle?: (styleId: string) => void;
}

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

export interface AIStyle {
  id: string;
  name: string;
  icon: any;
}

export const AI_STYLES: AIStyle[] = [
  {
    id: 'pixar',
    name: 'Pixar',
    icon: require('@/assets/ai-styles/pixar.webp'),
  },
  {
    id: 'anime',
    name: 'Anime',
    icon: require('@/assets/ai-styles/anime.webp'),
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    icon: require('@/assets/ai-styles/fantasy.webp'),
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    icon: require('@/assets/ai-styles/watercolor.webp'),
  },
  {
    id: 'storybook',
    name: 'Storybook',
    icon: require('@/assets/ai-styles/storybook.webp'),
  },
  {
    id: 'comic',
    name: 'Comic',
    icon: require('@/assets/ai-styles/comic.webp'),
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    icon: require('@/assets/ai-styles/cartoon.webp'),
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: require('@/assets/ai-styles/cyberpunk.webp'),
  },
  {
    id: 'pencil',
    name: 'Pencil',
    icon: require('@/assets/ai-styles/pencil.webp'),
  }
];

export const imageLoadingCache: Record<string, { loaded: boolean, error: boolean }> = {};
