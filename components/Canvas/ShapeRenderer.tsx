import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Line, Polygon, Ellipse } from 'react-native-svg';
import { ShapeData } from '@/types';

interface ShapeRendererProps {
  shapes: ShapeData[];
  currentShape: ShapeData | null;
}

export function ShapeRenderer({ shapes, currentShape }: ShapeRendererProps) {
  const allShapes = [...shapes];
  if (currentShape) allShapes.push(currentShape);
  
  return (
    <Svg style={StyleSheet.absoluteFill}>
      {allShapes.map((shape, index) => {
        const { id, type, x1, y1, x2, y2, color, strokeWidth } = shape;
        const key = `shape-${id}-${index}`;
        
        const minX = Math.min(x1, x2);
        const minY = Math.min(y1, y2);
        const maxX = Math.max(x1, x2);
        const maxY = Math.max(y1, y2);
        
        const width = maxX - minX;
        const height = maxY - minY;
        
        switch (type) {
          case 'rectangle':
            return (
              <Rect
                key={key}
                x={minX}
                y={minY}
                width={width}
                height={height}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
              />
            );
            
          case 'circle':
            const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;
            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            
            return (
              <Circle
                key={key}
                cx={centerX}
                cy={centerY}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
              />
            );
          
          case 'ellipse':
            const ellipseCenterX = (x1 + x2) / 2;
            const ellipseCenterY = (y1 + y2) / 2;
            const ellipseRadiusX = Math.abs(x2 - x1) / 2;
            const ellipseRadiusY = Math.abs(y2 - y1) / 2;
            
            return (
              <Ellipse
                key={key}
                cx={ellipseCenterX}
                cy={ellipseCenterY}
                rx={ellipseRadiusX}
                ry={ellipseRadiusY}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
              />
            );
          
          case 'line':
            return (
              <Line
                key={key}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            );
          
          case 'triangle':
            const points = `${minX + width/2},${minY} ${minX},${maxY} ${maxX},${maxY}`;
            
            return (
              <Polygon
                key={key}
                points={points}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                fill="none"
              />
            );
          
          default:
            return null;
        }
      })}
    </Svg>
  );
} 