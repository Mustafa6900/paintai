import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  StyleSheet,  
  View, 
  PanResponder, 
  Share, 
  Platform,
  Image,
  TouchableOpacity,
  ImageResizeMode,
  ActivityIndicator
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import * as SplashScreenModule from 'expo-splash-screen';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { ToolBar } from '@/components/ToolBar';
import { DRAW_MODES, DrawingLine, Point, ShapeData, AlertConfig, COLORS, AI_STYLES } from '@/types';
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
import { ThemedText } from '@/components/ThemedText';
import { AIProcessor, handleSaveAIImage } from '@/components/ToolBar/AIProcessor';
import { processAIStyle, getStyleName } from '@/services/aiService';

SplashScreenModule.preventAutoHideAsync();

export default function DrawingScreen() {
  // Tüm state tanımlamaları
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
  const [imageScale, setImageScale] = useState(1);
  const [imageFitMode, setImageFitMode] = useState('contain');
  const [appIsReady, setAppIsReady] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiProcessedImage, setAiProcessedImage] = useState<string | null>(null);

  const canvasRef = useRef(null);

  // Path oluşturma fonksiyonu memoize edildi
  const createPathFromPoints = useCallback((points: Point[]): string => {
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
  }, []);

  // Fonksiyonlar useCallback ile memoize ediliyor
  const clearCanvas = useCallback(() => {
    setLines([]);
    setCurrentLine([]);
    setShapes([]);
    setCurrentShape(null);
    setBackgroundImage(null);
  }, []);

  const handleUndo = useCallback(() => {
    if (shapes.length > 0) {
      setShapes(prev => prev.slice(0, -1));
    } else if (lines.length > 0) {
      setLines(prev => prev.slice(0, -1));
    } else if (backgroundImage) {
      setBackgroundImage(null);
    }
  }, [shapes.length, lines.length, backgroundImage]);

  // Alert Helper Functions
  const showAlert = useCallback((title: string, message: string, buttons = [{ text: t('ok'), onPress: () => {}, style: 'default' as const }]) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons,
      onDismiss: () => setAlertConfig(prev => ({ ...prev, visible: false }))
    });
  }, []);

  const showAlertNoButtons = useCallback((title: string, message: string) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: [],
      onDismiss: () => setAlertConfig(prev => ({ ...prev, visible: false }))
    });
  }, []);

  // Save function
  const handleSave = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        showAlert(t('save.errorTitle'), t('save.errorMessage'));
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      
      await MediaLibrary.createAssetAsync(uri);
      showAlert(t('save.successTitle'), t('save.successMessage'));
    } catch (error) {
      showAlert(t('save.errorTitle'), t('save.errorMessage'));
    }
  }, [showAlert, canvasRef]);

  // Share function
  const handleShare = useCallback(async () => {
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
          message: t('share.shareMessage')
        };
      } else {
        // Android 
        shareOptions = {
          title: t('share.shareTitle'),
          message: t('share.shareMessage'),
          url: uri
        };
      }
      
      // share
      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        showAlert(t('share.successTitle'), t('share.successMessage'));
      } else if (result.action === Share.dismissedAction) {
        showAlert(t('share.errorTitle'), t('share.errorMessage'));
      }
    } catch (error) {
      showAlert(t('share.errorTitle'), t('share.errorMessage'));
    }
  }, [canvasRef, showAlert]);

  // Clear function
  const handleClearRequest = useCallback(() => {
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
  }, [showAlert, clearCanvas]);

  // Image Upload function
  const handleAddImage = useCallback(async () => {
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
        setImageScale(1);
        setImageFitMode('cover');
        showAlert(t('imageUpload.successTitle'), t('imageUpload.successMessage'));
      }
    } catch (error) {
      showAlert(
        t('imageUpload.errorTitle'), 
        t('imageUpload.errorMessage')
      );
    }
  }, [showAlert]);

  // Görüntü kontrolü için fonksiyonlar
  const handleImageZoom = useCallback((scale: number) => {
    setImageScale(scale);
  }, []);

  const toggleImageFitMode = useCallback(() => {
    setImageFitMode(prevMode => prevMode === 'contain' ? 'cover' : 'contain');
  }, []);

  // Tool toggle function
  const handleToggleTool = useCallback((isPencil: boolean, size?: number) => {    
    if (size) {
      setBrushSize(size);
      
      if (isPencil) {
        updateRecentPencilSizes(size);
      }
    }
    
    // Color change (for eraser, white)
    if (!isPencil) {
      if (selectedColor !== '#FFFFFF') {
        setLastPencilColor(selectedColor);
      }
      setSelectedColor('#FFFFFF');
    } else {
      if (selectedColor === '#FFFFFF') {
        setSelectedColor(lastPencilColor);
      }
    }
  }, [selectedColor, lastPencilColor]);
  
  // Update recent pencil sizes
  const updateRecentPencilSizes = useCallback((newSize: number) => {
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
  }, [recentPencilSizes]);

  // Color change function
  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
    if (currentDrawMode === DRAW_MODES.PENCIL) {
      setLastPencilColor(color);
    }
  }, [currentDrawMode]);

  // Ai işleme fonksiyonu
  const handleApplyAIStyle = useCallback(async (styleId: string) => {
    try {
      setIsAIProcessing(true);
      
      showAlertNoButtons(
        t('ai.processingTitle'), 
        t('ai.processingMessage', { style: getStyleName(styleId) })
      );
      
      const result = await processAIStyle(canvasRef, styleId);
      
      if (result.success && result.imageUri) {
        setAiProcessedImage(result.imageUri);
        
        showAlert(
          t('ai.successTitle'), 
          t('ai.successMessage'),
          [
            {
              text: t('ok'),
              onPress: () => setAiProcessedImage(null),
              style: 'default' as const
            }
          ]
        );
      } else {
        showAlert(t('ai.errorTitle'), t('ai.errorMessage'));
      }
    } catch (error) {
      showAlert(t('ai.errorTitle'), t('ai.errorMessage'));
    } finally {
      setIsAIProcessing(false);
    }
  }, [showAlert, showAlertNoButtons, canvasRef]);

  const saveAIImage = useCallback(async () => {
    await handleSaveAIImage(
      aiProcessedImage, 
      showAlert,
      () => setAiProcessedImage(null)
    );
  }, [aiProcessedImage, showAlert]);

  const closeAIImage = useCallback(() => {
    setAiProcessedImage(null);
  }, []);

  // Çizgilerin render edilmesi memoize edildi
  const renderLines = useCallback(() => {
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
  }, [lines, currentLine, currentDrawMode, selectedColor, brushSize, createPathFromPoints]);

  // Şekillerin render edilmesi memoize edildi
  const renderShapes = useCallback(() => {
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
      
      // Şekil tipine göre render
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
    });
  }, [shapes, currentShape]);

  // PanResponder'ı useMemo ile optimize ediyoruz
  const panResponder = useMemo(() => PanResponder.create({
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
    onPanResponderRelease: () => {
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
  }), [currentDrawMode, selectedShape, currentShape, currentLine, selectedColor, brushSize, createPathFromPoints]);

  // Ana SVG bileşeni memoization
  const mainSvgCanvas = useMemo(() => (
    <Svg 
      style={[
        styles.svgCanvas,
        (isAIProcessing || aiProcessedImage) && { opacity: 0 }
      ]} 
      width="100%" 
      height="100%"
    >
      {renderLines()}
      {renderShapes()}
    </Svg>
  ), [renderLines, renderShapes, isAIProcessing, aiProcessedImage]);

  // Arkaplan görüntü bileşeni
  const backgroundImageComponent = useMemo(() => (
    backgroundImage ? (
      <Image 
        source={{ uri: backgroundImage }} 
        style={[
          styles.backgroundImage,
          { transform: [{ scale: imageScale }] }
        ]}
        resizeMode={imageFitMode as ImageResizeMode}
      />
    ) : null
  ), [backgroundImage, imageScale, imageFitMode]);

  // AI işlenmiş görüntü bileşeni
  const aiProcessedImageComponent = useMemo(() => (
    aiProcessedImage ? (
      <Image 
        source={{ uri: aiProcessedImage }} 
        style={styles.aiProcessedImage}
        resizeMode="contain"
      />
    ) : null
  ), [aiProcessedImage]);

  // Splash screen
  useEffect(() => {
    async function prepareApp() {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('App loading error', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  useEffect(() => {
    async function hideSplashScreen() {
      if (appIsReady) {
        await SplashScreenModule.hideAsync();
      }
    }
    
    hideSplashScreen();
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

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
          {backgroundImageComponent}
          
          {/* AI işlenmiş görüntü (varsa) */}
          {aiProcessedImageComponent}
          
          {mainSvgCanvas}
        </View>
      </View>
      
      {/* Image control buttons */}
      {backgroundImage && (
        <View style={styles.imageControlsContainer}>
          <TouchableOpacity style={styles.imageControlButton} onPress={() => handleImageZoom(imageScale + 0.1)}>
            <ThemedText style={styles.imageControlText}>+</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageControlButton} onPress={() => handleImageZoom(Math.max(0.5, imageScale - 0.1))}>
            <ThemedText style={styles.imageControlText}>-</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageControlButton} onPress={toggleImageFitMode}>
            <ThemedText style={styles.imageControlText}>📏</ThemedText>
          </TouchableOpacity>
        </View>
      )}
      
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
        onApplyAIStyle={handleApplyAIStyle}
      />
      
      {/* AI İşlem Sonucu veya Yükleniyor Göstergesi */}
      <AIProcessor
        aiProcessedImage={aiProcessedImage}
        isLoading={isAIProcessing}
        onClose={closeAIImage}
        onSave={saveAIImage}
        showAlert={showAlert}
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
  imageControlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    zIndex: 10,
  },
  imageControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 193, 7, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#FFB300',
  },
  imageControlText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  aiProcessedImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 10, // SVG üzerinde göster
  },
}); 