import { useState, useRef } from 'react';
import { PanResponder } from 'react-native';
import { DrawingLine, Point, ShapeData, DRAW_MODES } from '@/types';

export function useDrawing() {
  const [lines, setLines] = useState<DrawingLine[]>([]);
  const [currentLine, setCurrentLine] = useState<Point[]>([]);
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [currentShape, setCurrentShape] = useState<ShapeData | null>(null);

  // Drawing functions
  const createPathFromPoints = (points: Point[]): string => {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      if (i < points.length - 1) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        path += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
      } else {
        path += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    return path;
  };

  // Clear function
  const clearCanvas = () => {
    setLines([]);
    setCurrentLine([]);
    setShapes([]);
    setCurrentShape(null);
  };

  // Undo function
  const handleUndo = () => {
    if (shapes.length > 0) {
      setShapes(prev => prev.slice(0, -1));
    } else if (lines.length > 0) {
      setLines(prev => prev.slice(0, -1));
    }
  };

  // Create PanResponder (Touch event) function
  const createPanResponder = (
    currentDrawMode: string,
    selectedShape: string | null,
    selectedColor: string,
    brushSize: number
  ) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;

        if (currentDrawMode === DRAW_MODES.SHAPE && selectedShape) {
          setCurrentShape({
            id: Date.now().toString(),
            type: selectedShape,
            x1: locationX,
            y1: locationY,
            x2: locationX,
            y2: locationY,
            color: selectedColor,
            strokeWidth: brushSize
          });
        } else if (currentDrawMode === DRAW_MODES.PENCIL || currentDrawMode === DRAW_MODES.ERASER) {
          const newPoint = { x: locationX, y: locationY };
          setCurrentLine([newPoint]);
        }
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;

        if (currentDrawMode === DRAW_MODES.SHAPE && currentShape) {
          setCurrentShape(prevShape =>
            prevShape ? {
              ...prevShape,
              x2: locationX,
              y2: locationY,
            } : null
          );
        } else if (currentDrawMode === DRAW_MODES.PENCIL || currentDrawMode === DRAW_MODES.ERASER) {
          setCurrentLine(prevLine => {
            const newLine = [...prevLine, { x: locationX, y: locationY }];
            return newLine;
          });
        }
      },
      onPanResponderRelease: (evt) => {
        if (currentDrawMode === DRAW_MODES.SHAPE && currentShape) {
          setShapes(prevShapes => [...prevShapes, currentShape]);
          setCurrentShape(null);
        } else if (currentLine.length > 0) {
          const pathString = currentLine.length > 1
            ? createPathFromPoints(currentLine)
            : '';

          setLines(prevLines => [
            ...prevLines,
            {
              points: currentLine,
              color: selectedColor,
              thickness: brushSize,
              tool: currentDrawMode,
              path: pathString
            }
          ]);

          setCurrentLine([]);
        }
      }
    });
  };

  return {
    lines,
    currentLine,
    shapes,
    currentShape,
    createPathFromPoints,
    clearCanvas,
    handleUndo,
    createPanResponder
  };
} 