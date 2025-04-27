import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LineRenderer } from './LineRenderer';
import { ShapeRenderer } from './ShapeRenderer';
import { DrawingLine, Point, ShapeData } from '@/types';

interface CanvasProps {
  canvasRef: React.RefObject<View>;
  lines: DrawingLine[];
  currentLine: Point[];
  shapes: ShapeData[];
  currentShape: ShapeData | null;
  createPathFromPoints: (points: Point[]) => string;
  currentDrawMode: string;
  selectedColor: string;
  brushSize: number;
  panHandlers: any;
}

export function Canvas({
  canvasRef,
  lines,
  currentLine,
  shapes,
  currentShape,
  createPathFromPoints,
  currentDrawMode,
  selectedColor,
  brushSize,
  panHandlers
}: CanvasProps) {
  return (
    <View style={styles.canvasContainer} {...panHandlers}>
      <View 
        style={styles.canvas} 
        ref={canvasRef}
        collapsable={false}
        renderToHardwareTextureAndroid={true}
      >
        <LineRenderer 
          lines={lines}
          currentLine={currentLine}
          createPathFromPoints={createPathFromPoints}
          currentDrawMode={currentDrawMode}
          selectedColor={selectedColor}
          brushSize={brushSize}
        />
        <ShapeRenderer 
          shapes={shapes}
          currentShape={currentShape}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvasContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 0,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    width: '100%',
    height: '100%',
    elevation: 0
  }
});

export default Canvas; 