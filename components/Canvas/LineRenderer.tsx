import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { DrawingLine, Point, DRAW_MODES } from '@/types';

interface LineRendererProps {
  lines: DrawingLine[];
  currentLine: Point[];
  createPathFromPoints: (points: Point[]) => string;
  currentDrawMode: string;
  selectedColor: string;
  brushSize: number;
}

export function LineRenderer({
  lines,
  currentLine,
  createPathFromPoints,
  currentDrawMode,
  selectedColor,
  brushSize
}: LineRendererProps) {
  return (
    <Svg style={StyleSheet.absoluteFill}>
      {lines.map((line, index) => {
        // Tek nokta çizimi için
        if (line.points.length === 1) {
          const point = line.points[0];
          return (
            <Circle
              key={`dot-${index}`}
              cx={point.x}
              cy={point.y}
              r={line.thickness/2}
              fill={line.tool === DRAW_MODES.ERASER ? '#FFFFFF' : line.color}
            />
          );
        }
        
        return (
          <Path
            key={`line-${index}`}
            d={line.path || createPathFromPoints(line.points)}
            stroke={line.tool === DRAW_MODES.ERASER ? '#FFFFFF' : line.color}
            strokeWidth={line.thickness}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      })}
      
      {currentLine.length > 1 ? (
        <Path
          d={createPathFromPoints(currentLine)}
          stroke={currentDrawMode === DRAW_MODES.ERASER ? '#FFFFFF' : selectedColor}
          strokeWidth={brushSize}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : currentLine.length === 1 ? (
        <Circle
          cx={currentLine[0].x}
          cy={currentLine[0].y}
          r={brushSize/2}
          fill={currentDrawMode === DRAW_MODES.ERASER ? '#FFFFFF' : selectedColor}
        />
      ) : null}
    </Svg>
  );
} 