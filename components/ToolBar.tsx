import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Animated,
  Dimensions,
  LayoutChangeEvent,
  ScrollView
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';

// Çizim modları
export const DRAW_MODES = {
  PENCIL: 'pencil',
  ERASER: 'eraser',
  SHAPE: 'shape'
};

// Hazır şekiller listesi
const SHAPES = [
  { id: 'rectangle', name: 'Kare', icon: '⬜' },
  { id: 'circle', name: 'Daire', icon: '⭕' },
  { id: 'triangle', name: 'Üçgen', icon: '🔺' },
  { id: 'line', name: 'Çizgi', icon: '➖' },
  { id: 'arrow', name: 'Ok', icon: '➡️' },
  { id: 'star', name: 'Yıldız', icon: '⭐' },
  { id: 'heart', name: 'Kalp', icon: '❤️' },
  { id: 'ellipse', name: 'Oval', icon: '🔵' },
  { id: 'pentagon', name: 'Beşgen', icon: '⬟' },
  { id: 'hexagon', name: 'Altıgen', icon: '⬢' }
];

interface ToolBarProps {
  onUndo: () => void;
  onToggleTool: (isPencil: boolean, size?: number) => void;
  isPencilActive: boolean;
  visible: boolean;
  currentSize: number;
  recentPencilSizes: number[];
  // Yeni eklenen özellikler
  selectedColor: string;
  colors: string[];
  setSelectedColor: (color: string) => void;
  selectedShape: string | null;
  setSelectedShape: (shape: string | null) => void;
  currentDrawMode: string;
  setCurrentDrawMode: (mode: string) => void;
}

export function ToolBar({ 
  onUndo, 
  onToggleTool, 
  isPencilActive,
  visible,
  currentSize,
  recentPencilSizes = [5, 10, 15],
  // Yeni parametreler
  selectedColor,
  colors,
  setSelectedColor,
  selectedShape,
  setSelectedShape,
  currentDrawMode,
  setCurrentDrawMode
}: ToolBarProps) {
  const [showPencilSizes, setShowPencilSizes] = useState(false);
  const [showEraserSizes, setShowEraserSizes] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  
  // Buton referansları için
  const pencilButtonRef = useRef<View>(null);
  const eraserButtonRef = useRef<View>(null);
  const colorButtonRef = useRef<View>(null);
  const shapeButtonRef = useRef<View>(null);
  
  // Buton pozisyonları için
  const [pencilButtonTop, setPencilButtonTop] = useState(0);
  const [eraserButtonTop, setEraserButtonTop] = useState(0);
  const [colorButtonTop, setColorButtonTop] = useState(0);
  const [shapeButtonTop, setShapeButtonTop] = useState(0);
  
  // Animasyon değerleri
  const pencilSizeAnimation = new Animated.Value(0);
  const eraserSizeAnimation = new Animated.Value(0);
  const colorPaletteAnimation = new Animated.Value(0);
  const shapesAnimation = new Animated.Value(0);
  
  // Silgi boyutları - Kalem boyutlarıyla aynı olmalı
  const pencilSizes = [3, 6, 8, 10, 12, 15, 20, 25, 30];
  // Silgi ve kalem için aynı boyutları kullanıyoruz
  
  // Tüm menüleri kapat
  const closeAllMenus = () => {
    setShowPencilSizes(false);
    setShowEraserSizes(false);
    setShowColorPalette(false);
    setShowShapes(false);
  };
  
  // Çizim modu değiştiğinde uygun menüleri aç/kapat
  useEffect(() => {
    if (currentDrawMode === DRAW_MODES.PENCIL) {
      setShowEraserSizes(false);
      setShowShapes(false);
    } else if (currentDrawMode === DRAW_MODES.ERASER) {
      setShowPencilSizes(false);
      setShowShapes(false);
    } else if (currentDrawMode === DRAW_MODES.SHAPE) {
      setShowPencilSizes(false);
      setShowEraserSizes(false);
    }
  }, [currentDrawMode]);
  
  // Animasyonları güncelle
  useEffect(() => {
    Animated.timing(pencilSizeAnimation, {
      toValue: showPencilSizes ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
    
    Animated.timing(eraserSizeAnimation, {
      toValue: showEraserSizes ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
    
    Animated.timing(colorPaletteAnimation, {
      toValue: showColorPalette ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
    
    Animated.timing(shapesAnimation, {
      toValue: showShapes ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  }, [showPencilSizes, showEraserSizes, showColorPalette, showShapes]);
  
  // Layout işlevleri - pozisyonları alır
  const onPencilButtonLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setPencilButtonTop(y + height/2 - 20);
  };
  
  const onEraserButtonLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setEraserButtonTop(y + height/2 - 20);
  };
  
  const onColorButtonLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setColorButtonTop(y + height/2 - 20);
  };
  
  const onShapeButtonLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setShapeButtonTop(y + height/2 - 20);
  };
  
  // Görsel boyut skalası
  const getVisualSize = (size: number, eraser: boolean = false) => {
    if (eraser) {
      if (size === 10) return 10;
      if (size === 20) return 15;
      if (size === 30) return 20;
    }
    return Math.min(size, 20);
  };
  
  // Buton işlevleri
  const handlePencilPress = () => {
    if (currentDrawMode !== DRAW_MODES.PENCIL) {
      setCurrentDrawMode(DRAW_MODES.PENCIL);
      onToggleTool(true);
    }
    
    closeAllMenus();
    setShowPencilSizes(!showPencilSizes);
  };
  
  const handleEraserPress = () => {
    if (currentDrawMode !== DRAW_MODES.ERASER) {
      setCurrentDrawMode(DRAW_MODES.ERASER);
      onToggleTool(false);
    }
    
    closeAllMenus();
    setShowEraserSizes(!showEraserSizes);
  };
  
  const handleColorPress = () => {
    closeAllMenus();
    setShowColorPalette(!showColorPalette);
    
    // Renk seçildiğinde kalem moduna geç
    if (currentDrawMode !== DRAW_MODES.PENCIL) {
      setCurrentDrawMode(DRAW_MODES.PENCIL);
      onToggleTool(true);
    }
  };
  
  const handleShapePress = () => {
    closeAllMenus();
    setShowShapes(!showShapes);
    
    // Şekil menüsü açıldığında şekil moduna geç
    setCurrentDrawMode(DRAW_MODES.SHAPE);
  };
  
  // Seçim işlevleri
  const selectPencilSize = (size: number) => {
    onToggleTool(true, size);
    setCurrentDrawMode(DRAW_MODES.PENCIL);
    closeAllMenus();
  };
  
  const selectEraserSize = (size: number) => {
    onToggleTool(false, size);
    setCurrentDrawMode(DRAW_MODES.ERASER);
    closeAllMenus();
  };
  
  const selectColor = (color: string) => {
    setSelectedColor(color);
    closeAllMenus();
  };
  
  const selectShape = (shapeId: string) => {
    setSelectedShape(shapeId);
    setCurrentDrawMode(DRAW_MODES.SHAPE);
    closeAllMenus();
  };
  
  return (
    <View style={styles.mainContainer}>
      {/* Kalem boyut menüsü */}
      <Animated.View 
        style={[
          styles.sizeMenuContainer,
          {
            opacity: pencilSizeAnimation,
            width: pencilSizeAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 180]
            }),
            right: 55,
            top: pencilButtonTop,
            display: showPencilSizes ? 'flex' : 'none'
          }
        ]}
      >
        <ScrollView style={styles.scrollMenu}>
          <View style={styles.sizesWrapper}>
            {pencilSizes.map((size, index) => (
              <TouchableOpacity 
                key={`pencil-${index}`}
                style={[
                  styles.sizeButton, 
                  size === currentSize && currentDrawMode === DRAW_MODES.PENCIL ? styles.activeSizeButton : null
                ]} 
                onPress={() => selectPencilSize(size)}
              >
                <View 
                  style={[
                    styles.sizeCircle, 
                    { 
                      width: getVisualSize(size), 
                      height: getVisualSize(size),
                      borderWidth: 2,
                      backgroundColor: selectedColor
                    }
                  ]} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
      
      {/* Silgi boyut menüsü - Kalem boyutlarıyla aynı olmalı */}
      <Animated.View 
        style={[
          styles.sizeMenuContainer, // Menü konteyneri stil değişikliği
          {
            opacity: eraserSizeAnimation,
            width: eraserSizeAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 180] // Genişliği kalem menüsüyle aynı
            }),
            right: 55,
            top: eraserButtonTop,
            display: showEraserSizes ? 'flex' : 'none'
          }
        ]}
      >
        <ScrollView style={styles.scrollMenu}>
          <View style={styles.sizesWrapper}>
            {pencilSizes.map((size, index) => ( // Aynı boyutları silgi için de kullan
              <TouchableOpacity 
                key={`eraser-${index}`}
                style={[
                  styles.sizeButton,
                  size === currentSize && currentDrawMode === DRAW_MODES.ERASER ? styles.activeSizeButton : null
                ]} 
                onPress={() => selectEraserSize(size)}
              >
                <View 
                  style={[
                    styles.eraserSizeBorder, 
                    { 
                      width: getVisualSize(size), // Görsel boyut fonksiyonunu kullan
                      height: getVisualSize(size),
                      borderWidth: 2,
                    }
                  ]} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
      
      {/* Renk paleti menüsü */}
      <Animated.View 
        style={[
          styles.colorPaletteMenu,
          {
            opacity: colorPaletteAnimation,
            width: colorPaletteAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 200]
            }),
            right: 55,
            top: colorButtonTop,
            display: showColorPalette ? 'flex' : 'none'
          }
        ]}
      >
        <ScrollView style={styles.scrollMenu}>
          <View style={styles.colorPaletteWrapper}>
            {colors.map((color, index) => (
              <TouchableOpacity 
                key={`color-${index}`}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor
                ]} 
                onPress={() => selectColor(color)}
              />
            ))}
          </View>
        </ScrollView>
      </Animated.View>
      
      {/* Şekiller menüsü - %15 küçültme */}
      <Animated.View 
        style={[
          styles.shapesMenu,
          {
            opacity: shapesAnimation,
            width: shapesAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 170] // 200'den %15 küçük (170)
            }),
            right: 55,
            top: shapeButtonTop,
            display: showShapes ? 'flex' : 'none'
          }
        ]}
      >
        <ScrollView style={[styles.scrollMenu, { maxHeight: 153 }]}> {/* %15 küçültme */}
          <View style={styles.shapesWrapper}>
            {SHAPES.map((shape) => (
              <TouchableOpacity 
                key={`shape-${shape.id}`}
                style={[
                  styles.shapeOption,
                  selectedShape === shape.id && currentDrawMode === DRAW_MODES.SHAPE ? styles.selectedShape : null
                ]} 
                onPress={() => selectShape(shape.id)}
              >
                <ThemedText style={styles.shapeIcon}>{shape.icon}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
      
      {/* Ana araç çubuğu */}
      <Animated.View style={[
        styles.container,
        { opacity: visible ? 1 : 0 }
      ]}>
        <TouchableOpacity style={styles.toolButton} onPress={onUndo}>
          <ThemedText style={styles.toolButtonIcon}>↩️</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          ref={pencilButtonRef}
          onLayout={onPencilButtonLayout}
          style={[
            styles.toolButton, 
            isPencilActive ? styles.activeToolButton : null
          ]} 
          onPress={handlePencilPress}
        >
          <ThemedText style={styles.toolButtonIcon}>✏️</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          ref={eraserButtonRef}
          onLayout={onEraserButtonLayout}
          style={[
            styles.toolButton, 
            !isPencilActive ? styles.activeToolButton : null
          ]} 
          onPress={handleEraserPress}
        >
          <ThemedText style={styles.toolButtonIcon}>🧽</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          ref={colorButtonRef}
          onLayout={onColorButtonLayout}
          style={[
            styles.toolButton, // Renk paleti butonu için arka planı düzeltme
            { backgroundColor: '#FFECB3' } // Diğer butonlarla aynı
          ]} 
          onPress={handleColorPress}
        >
          <View style={[
            styles.colorButtonIndicator, 
            { backgroundColor: selectedColor }
          ]} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          ref={shapeButtonRef}
          onLayout={onShapeButtonLayout}
          style={[
            styles.toolButton, 
            currentDrawMode === DRAW_MODES.SHAPE ? styles.activeToolButton : null
          ]} 
          onPress={handleShapePress}
        >
          <ThemedText style={styles.toolButtonIcon}>📐</ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    position: 'absolute',
    top: 40,
    right: 10,
    alignItems: 'center',
    zIndex: 5,
  },
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: '#FFECB3',
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  activeToolButton: {
    backgroundColor: '#FFB300',
    borderColor: '#FF8F00',
  },
  toolButtonIcon: {
    fontSize: 22,
  },
  sizeMenu: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: '#FFC107',
    marginRight: 10,
    overflow: 'hidden',
  },
  sizeMenuContainer: {
    position: 'absolute',
    backgroundColor: '#FFF9C4',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: '#FFC107',
    marginRight: 10,
    overflow: 'hidden',
    maxHeight: 180,
  },
  scrollMenu: {
    maxHeight: 170,
  },
  sizesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  sizeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 10,
    margin: 4,
    borderWidth: 1,
    borderColor: '#FFC107',
    backgroundColor: '#FFECB3',
  },
  activeSizeButton: {
    backgroundColor: '#FFB300',
    borderColor: '#FF8F00',
    borderWidth: 2,
  },
  sizeCircle: {
    backgroundColor: '#000000',
    borderRadius: 15,
    margin: 2,
  },
  eraserSizeBorder: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderColor: '#ddd',
  },
  colorPaletteMenu: {
    position: 'absolute',
    backgroundColor: '#FFF9C4',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: '#FFC107',
    marginRight: 10,
    overflow: 'hidden',
    maxHeight: 180,
  },
  colorPaletteWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#FF5722',
    transform: [{ scale: 1.1 }],
  },
  shapesMenu: {
    position: 'absolute',
    backgroundColor: '#FFF9C4',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: '#FFC107',
    marginRight: 10,
    overflow: 'hidden',
    maxHeight: 153, // %15 küçültme
  },
  shapesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  shapeOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    margin: 4,
  },
  selectedShape: {
    borderColor: '#FF5722',
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
    backgroundColor: '#FFF3E0',
  },
  shapeIcon: {
    fontSize: 20,
  },
  // Renk göstergesi için yeni stil
  colorButtonIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#555',
  },
}); 