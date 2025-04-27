import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Animated,
  LayoutChangeEvent,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { t } from '@/locales';

// Drawing modes
export const DRAW_MODES = {
  PENCIL: 'pencil',
  ERASER: 'eraser',
  SHAPE: 'shape'
};

const SHAPES = [
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

interface ToolBarProps {
  onUndo: () => void;
  onToggleTool: (isPencil: boolean, size?: number) => void;

  isPencilActive: boolean;
  visible: boolean;
  brushSize: number;
  recentPencilSizes: number[];
    
  selectedColor: string;
  colors: string[];
  setSelectedColor: (color: string) => void;

  selectedShape: string | null;
  setSelectedShape: (shape: string | null) => void;
  currentDrawMode: string;
  setCurrentDrawMode: (mode: string) => void;

  onSave: () => void;
  onShare: () => void;
  onClear: () => void;
}

export function ToolBar({ 
  onUndo, 
  onToggleTool, 
  visible,
  brushSize,
  selectedColor,
  colors,
  setSelectedColor,
  selectedShape,
  setSelectedShape,
  currentDrawMode,
  setCurrentDrawMode,
  onSave,
  onShare,
  onClear
}: ToolBarProps) {
  const [showPencilSizes, setShowPencilSizes] = useState(false);
  const [showEraserSizes, setShowEraserSizes] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Buton Ref
  const pencilButtonRef = useRef<View>(null);
  const eraserButtonRef = useRef<View>(null);
  const colorButtonRef = useRef<View>(null);
  const shapeButtonRef = useRef<View>(null);
  const settingsButtonRef = useRef<View>(null);
  
  // Buton Position
  const [pencilButtonTop, setPencilButtonTop] = useState(0);
  const [eraserButtonTop, setEraserButtonTop] = useState(0);
  const [colorButtonTop, setColorButtonTop] = useState(0);
  const [shapeButtonTop, setShapeButtonTop] = useState(0);
  const [settingsButtonTop, setSettingsButtonTop] = useState(0);
  
  // Animation Values
  const pencilSizeAnimation = new Animated.Value(0);
  const eraserSizeAnimation = new Animated.Value(0);
  const colorPaletteAnimation = new Animated.Value(0);
  const shapesAnimation = new Animated.Value(0);
  const settingsAnimation = new Animated.Value(0);
  
  // Eraser Sizes - Same as Pencil Sizes
  const pencilSizes = [3, 6, 8, 10, 12, 15, 20, 25, 30];
  
  // Close All Menus
  const closeAllMenus = () => {
    setShowPencilSizes(false);
    setShowEraserSizes(false);
    setShowColorPalette(false);
    setShowShapes(false);
    setShowSettings(false);
  };
  
  // When the drawing mode changes, open/close the appropriate menus
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
  
  // Update Animations
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
    
    Animated.timing(settingsAnimation, {
      toValue: showSettings ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  }, [showPencilSizes, showEraserSizes, showColorPalette, showShapes, showSettings]);
  
  // Layout Functions - Get Positions
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
  
  const onSettingsButtonLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setSettingsButtonTop(y + height/2 - 20);
  };
  
  // Visual Size Scale
  const getVisualSize = (size: number, eraser: boolean = false) => {
    if (eraser) {
      if (size === 10) return 10;
      if (size === 20) return 15;
      if (size === 30) return 20;
    }
    return Math.min(size, 20);
  };
  
  // Button Functions
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
    
    // When a color is selected, switch to pencil mode
    if (currentDrawMode !== DRAW_MODES.PENCIL) {
      setCurrentDrawMode(DRAW_MODES.PENCIL);
      onToggleTool(true);
    }
  };
  
  const handleShapePress = () => {
    closeAllMenus();
    setShowShapes(!showShapes);
    
    // When the shape menu is opened, switch to shape mode
    setCurrentDrawMode(DRAW_MODES.SHAPE);
  };
  
  const handleSettingsPress = () => {
    closeAllMenus();
    setShowSettings(!showSettings);
  };
  
  // For clearing, confirm dialog
  const handleClearPress = () => {
    onClear();
  };
  
  // Selection Functions
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

      {/* Settings Menu */}
      <Animated.View 
        style={[
          styles.settingsMenu,
          {
            opacity: settingsAnimation,
            width: settingsAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 170]
            }),
            right: 55,
            top: settingsButtonTop,
            display: showSettings ? 'flex' : 'none'
          }
        ]}
      >
        <View style={styles.settingsWrapper}>
          <TouchableOpacity 
            style={styles.settingsButton} 
            onPress={onSave}
          >
            <ThemedText style={styles.settingsButtonIcon}>💾</ThemedText>
            <ThemedText style={styles.settingsButtonText}>{t('save.title')}</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingsButton} 
            onPress={onShare}
          >
            <ThemedText style={styles.settingsButtonIcon}>🚀</ThemedText>
            <ThemedText style={styles.settingsButtonText}>{t('share.title')}</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingsButton} 
            onPress={handleClearPress}
          >
            <ThemedText style={styles.settingsButtonIcon}>🗑️</ThemedText>
            <ThemedText style={styles.settingsButtonText}>{t('clear.title')}</ThemedText>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Pencil Size Menu */}
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
                  size === brushSize && currentDrawMode === DRAW_MODES.PENCIL ? styles.activeSizeButton : null
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
      
      {/* Eraser Size Menu */}
      <Animated.View 
        style={[
          styles.sizeMenuContainer,
          {
            opacity: eraserSizeAnimation,
            width: eraserSizeAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 180]
            }),
            right: 55,
            top: eraserButtonTop,
            display: showEraserSizes ? 'flex' : 'none'
          }
        ]}
      >
        <ScrollView style={styles.scrollMenu}>
          <View style={styles.sizesWrapper}>
            {pencilSizes.map((size, index) => (
              <TouchableOpacity 
                key={`eraser-${index}`}
                style={[
                  styles.sizeButton,
                  size === brushSize && currentDrawMode === DRAW_MODES.ERASER ? styles.activeSizeButton : null
                ]} 
                onPress={() => selectEraserSize(size)}
              >
                <View 
                  style={[
                    styles.eraserSizeBorder, 
                    { 
                      width: getVisualSize(size),
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
      
      {/* Color Palette Menu */}
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
      
      {/* Shapes Menu */}
      {/* 
      <Animated.View 
        style={[
          styles.shapesMenu,
          {
            opacity: shapesAnimation,
            width: shapesAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 170]
            }),
            right: 55,
            top: shapeButtonTop,
            display: showShapes ? 'flex' : 'none'
          }
        ]}
      >
        <ScrollView style={[styles.scrollMenu, { maxHeight: 153 }]}>
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
      */}

      {/* Main Toolbar */}
      <Animated.View style={[
        styles.container,
        { opacity: visible ? 1 : 0 }
      ]}>

        <TouchableOpacity 
          ref={settingsButtonRef}
          onLayout={onSettingsButtonLayout}
          style={styles.toolButton} 
          onPress={handleSettingsPress}
        >
          <ThemedText style={styles.toolButtonIcon}>⚙️</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolButton} onPress={onUndo}>
          <ThemedText style={styles.toolButtonIcon}>↩️</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          ref={pencilButtonRef}
          onLayout={onPencilButtonLayout}
          style={[
            styles.toolButton, 
            currentDrawMode === DRAW_MODES.PENCIL ? styles.activeToolButton : null
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
            currentDrawMode === DRAW_MODES.ERASER ? styles.activeToolButton : null
          ]} 
          onPress={handleEraserPress}
        >
          <ThemedText style={styles.toolButtonIcon}>🧽</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          ref={colorButtonRef}
          onLayout={onColorButtonLayout}
          style={[
            styles.toolButton,
            { backgroundColor: '#FFECB3' }
          ]} 
          onPress={handleColorPress}
        >
          <View style={[
            styles.colorButtonIndicator, 
            { backgroundColor: selectedColor }
          ]} />
        </TouchableOpacity>
        
        {/* Shape Button */}
        {/* 
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
        */}
      
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    position: 'absolute',
    top: 20,
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
    maxHeight: 153,
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
  colorButtonIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#555',
  },
  // Yeni ayarlar menüsü stilleri
  settingsMenu: {
    position: 'absolute',
    backgroundColor: '#FFF9C4',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: '#FFC107',
    marginRight: 10,
    overflow: 'hidden',
  },
  settingsWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 5,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 8,
    backgroundColor: '#FFECB3',
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  settingsButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#333',
  },
}); 