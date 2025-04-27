import { useState, useRef } from 'react';
import { Animated } from 'react-native';
import { DRAW_MODES } from '@/types';

export function useTools() {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const toolbarHeight = useRef(new Animated.Value(1)).current;
  const [isPencilActive, setIsPencilActive] = useState(true);
  const [recentPencilSizes, setRecentPencilSizes] = useState([5, 10, 15]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [currentDrawMode, setCurrentDrawMode] = useState(DRAW_MODES.PENCIL);

  const colors = [
    '#000000', '#FFFFFF', '#808080', // Black, White, Gray
    '#FF0000', '#FF4500', '#FF6347', // Red shades
    '#FFA500', '#FFD700', '#FFFF00', // Orange and yellow
    '#32CD32', '#00FF00', '#008000', // Green shades
    '#00FFFF', '#00BFFF', '#0000FF', // Blue shades
    '#800080', '#9370DB', '#FF00FF', // Purple shades
    '#FFDAB9', // Peach
    '#A52A2A', '#8B4513', '#CD853F'  // Brown shades
  ];

  // Tool change function
  const handleToggleTool = (isPencil: boolean, size?: number) => {
    setIsPencilActive(isPencil);

    // Size changes
    if (size) {
      setBrushSize(size);

      if (isPencil) {
        updateRecentPencilSizes(size);
      }
    }

    // Color change (white for eraser)
    if (!isPencil) {
      setSelectedColor('#FFFFFF');
    } else {
      if (selectedColor === '#FFFFFF') {
        setSelectedColor('#000000');
      }
    }
  };

  // Update recent pencil sizes
  const updateRecentPencilSizes = (newSize: number) => {
    if (recentPencilSizes.includes(newSize)) {
      const newSizes = [
        newSize,
        ...recentPencilSizes.filter(size => size !== newSize)
      ].slice(0, 3);

      setRecentPencilSizes(newSizes);
    } else {
      const newSizes = [newSize, ...recentPencilSizes].slice(0, 3);
      setRecentPencilSizes(newSizes);
    }
  };

  return {
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
    toolbarVisible,
    setToolbarVisible,
    toolbarHeight,
    isPencilActive,
    setIsPencilActive,
    recentPencilSizes,
    setRecentPencilSizes,
    selectedShape,
    setSelectedShape,
    currentDrawMode,
    setCurrentDrawMode,
    colors,
    handleToggleTool,
    updateRecentPencilSizes
  };
} 