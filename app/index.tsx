import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet,  
  View, 
  PanResponder, 
  Share, 
  Platform,
  Image
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import * as SplashScreenModule from 'expo-splash-screen';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { ToolBar } from '@/components/ToolBar/ToolBar';
import { DRAW_MODES, DrawingLine, Point, ShapeData, AlertConfig, COLORS } from '@/types';
import Svg, { 
  Path, 
  Rect, 
  Circle, 
  Line, 
  Polygon, 
  Ellipse
} from 'react-native-svg';
import { CustomAlert } from '@/components/CustomAlert';
import { t } from '@/locales';
import * as ImagePicker from 'expo-image-picker';

SplashScreenModule.preventAutoHideAsync();

export default function DrawingScreen() {
  const [lines, setLines] = useState<DrawingLine[]>([]);
  const [currentLine, setCurrentLine] = useState<Point[]>([]);
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [currentShape, setCurrentShape] = useState<ShapeData | null>(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [lastPencilColor, setLastPencilColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [recentPencilSizes, setRecentPencilSizes] = useState([5, 10, 15]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [currentDrawMode, setCurrentDrawMode] = useState(DRAW_MODES.PENCIL);
  const [colors, setColors] = useState(COLORS);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    onDismiss: () => {}
  });
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const canvasRef = useRef(null);

  // Clear function
  const clearCanvas = () => {
    setLines([]);
    setCurrentLine([]);
    setShapes([]);
    setCurrentShape(null);
  };

  // Undo function - separate control for shape and line
  const handleUndo = () => {
    if (shapes.length > 0) {
      setShapes(prev => prev.slice(0, -1));
    } else if (lines.length > 0) {
      setLines(prev => prev.slice(0, -1));
    }
  };

  // PanResponder create
  const panResponder = PanResponder.create({
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

  const createPathFromPoints = (points: Point[]): string => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      if (i < points.length - 1) {
        const xc = (points[i].x + points[i+1].x) / 2;
        const yc = (points[i].y + points[i+1].y) / 2;
        path += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
      } else {
        path += ` L ${points[i].x} ${points[i].y}`;
      }
    }
    
    return path;
  };

  // Drawing render
  const renderLines = () => {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        {lines.map((line, index) => {
          // For single point drawing
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
  };

  // Alert Helper Function
  const showAlert = (title: string, message: string, buttons = [{ text: t('save.successTitle'), onPress: () => {}, style: 'default' as const }]) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons,
      onDismiss: () => setAlertConfig(prev => ({ ...prev, visible: false }))
    });
  };

  // Save function
  const handleSave = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        showAlert(t('save.errorTitle'), t('save.errorMessage'));
        return;
      }
      
      showAlert(t('save.successTitle'), t('save.successMessage'));
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      
      const asset = await MediaLibrary.createAssetAsync(uri);
      showAlert(t('save.successTitle'), t('save.successMessage'));
    } catch (error) {
      showAlert(t('save.errorTitle'), t('save.errorMessage'));
    }
  };

  // Share function
  const handleShare = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
            
      // Platform control
      let shareOptions;
      if (Platform.OS === 'ios') {
        // iOS 
        shareOptions = {
          url: uri,
          message: t('shareMessage')
        };
      } else {
        // Android 
        shareOptions = {
          title: t('shareTitle'),
          message: t('shareMessage'),
          url: uri
        };
      }
      
      // share
      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          showAlert(t('share.successTitle'), t('share.successMessage'));
        } else {
          showAlert(t('share.successTitle'), t('share.successMessage'));
        }
      } else if (result.action === Share.dismissedAction) {
        showAlert(t('share.errorTitle'), t('share.errorMessage'));
      }
    } catch (error) {
      showAlert(t('share.errorTitle'), t('share.errorMessage'));
    }
  };

  // Clear function
  const handleClearRequest = () => {
    showAlert(
      t('clear.confirmTitle'),
      t('clear.confirmMessage'),
      [
        {
          text: t('clear.cancel'),
          onPress: () => {},
          style: 'default' as const
        },
        {
          text: t('clear.confirm'),
          onPress: clearCanvas,
          style: 'default' as const
        }
      ]
    );
  };

  // Image Upload function
  const handleAddImage = async () => {
    try {
      // Galeri izinlerini iste
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showAlert(
          t('imageUpload.requestPermissionErrorTitle'), 
          t('imageUpload.requestPermissionErrorMessage')
        );
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setBackgroundImage(result.assets[0].uri);
        showAlert(t('imageUpload.successTitle'), t('imageUpload.successMessage'));
      }
    } catch (error) {
      showAlert(
        t('imageUpload.errorTitle'), 
        t('imageUpload.errorMessage')
      );
    }
  };

  const handleToggleTool = (isPencil: boolean, size?: number) => {    
    // If size change, apply
    if (size) {
      setBrushSize(size);
      
      if (isPencil) {
        updateRecentPencilSizes(size);
      }
    }
    
    // Color change (for eraser, white)
    if (!isPencil) {
      // Silgiye geçerken, mevcut rengi kaydet (beyaz değilse)
      if (selectedColor !== '#FFFFFF') {
        setLastPencilColor(selectedColor);
      }
      setSelectedColor('#FFFFFF');
    } else {
      // Kaleme geçerken, önceki kalem rengini geri yükle
      if (selectedColor === '#FFFFFF') {
        setSelectedColor(lastPencilColor);
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
      // Yeni boyutu en başa ekle ve sadece 3 boyut tut
      const newSizes = [newSize, ...recentPencilSizes].slice(0, 3);
      setRecentPencilSizes(newSizes);
    }
  };

  // Renk seçme fonksiyonunu da güncelleyelim
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Kalem modunda yeni bir renk seçildiğinde, son rengi de güncelle
    if (currentDrawMode === DRAW_MODES.PENCIL) {
      setLastPencilColor(color);
    }
  };

  // Render shapes function
  const renderShapes = () => {
    const allShapes = [...shapes];
    if (currentShape) allShapes.push(currentShape);
    
    return allShapes.map((shape, index) => {
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
        
        // Diğer şekiller için gerekli kodları ekleyin
        
        default:
          return null;
      }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <View 
          style={styles.canvas} 
          ref={canvasRef}
          collapsable={false}
          renderToHardwareTextureAndroid={true}
        >
          {/* Background image */}
          {backgroundImage && (
            <Image 
              source={{ uri: backgroundImage }} 
              style={styles.backgroundImage}
              resizeMode="contain"
            />
          )}
          <Svg 
            style={styles.svgCanvas} 
            width="100%" 
            height="100%"
          >
            {renderLines()}
            {renderShapes()}
          </Svg>
        </View>
      </View>
      
      <ToolBar
        onUndo={handleUndo}
        onToggleTool={handleToggleTool}
        currentDrawMode={currentDrawMode}
        setCurrentDrawMode={setCurrentDrawMode}
        selectedColor={selectedColor}
        setSelectedColor={handleColorChange}
        colors={colors}
        brushSize={brushSize}
        visible={true}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        onSave={handleSave}
        onShare={handleShare}
        onClear={handleClearRequest}
        onAddImage={handleAddImage}
      />
      
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={alertConfig.onDismiss}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  },
  toggleButton: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -45,
    width: 90,
    height: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 1000,
    borderWidth: 2,
    borderColor: '#FFB300',
    borderBottomWidth: 0,
  },
  toggleButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  lineContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  temporaryShapeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },
  svgCanvas: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
}); 