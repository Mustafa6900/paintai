import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Platform, 
  PanResponder, 
  Share, 
  Alert,
  Animated,
  ScrollView
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as SplashScreenModule from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { DrawingToolbar, DRAW_MODES } from '@/components/DrawingToolbar';
import { AppHeader } from '@/components/AppHeader';
import { ToolBar } from '@/components/ToolBar';
import Svg, { 
  Path, 
  Rect, 
  Circle, 
  Line, 
  Polygon, 
  G, 
  Ellipse
} from 'react-native-svg';

// Splash ekranının otomatik kapanmasını engelleme
SplashScreenModule.preventAutoHideAsync();

// Çizgi noktası tipi
interface Point {
  x: number;
  y: number;
}

// Çizgi verisi tipi - tool özelliği eklendi
interface DrawingLine {
  points: Point[];
  color: string;
  thickness: number;
  tool: string;
  path?: string; // Path string'i ekledik
}

// Şekil verisi tipi
interface ShapeData {
  id: string;
  type: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  strokeWidth: number;
}

export default function DrawingScreen() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreenModule.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const [lines, setLines] = useState<DrawingLine[]>([]);
  const [currentLine, setCurrentLine] = useState<Point[]>([]);
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [currentShape, setCurrentShape] = useState<ShapeData | null>(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const toolbarHeight = useRef(new Animated.Value(1)).current;
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isPencilActive, setIsPencilActive] = useState(true);
  const [recentPencilSizes, setRecentPencilSizes] = useState([5, 10, 15]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [currentDrawMode, setCurrentDrawMode] = useState(DRAW_MODES.PENCIL);
  const [temporaryShape, setTemporaryShape] = useState<any>(null);
  
  const colors = [
    '#000000', '#FFFFFF', '#808080', // Siyah, Beyaz, Gri
    '#FF0000', '#FF4500', '#FF6347', // Kırmızı tonları
    '#FFA500', '#FFD700', '#FFFF00', // Turuncu ve sarı
    '#32CD32', '#00FF00', '#008000', // Yeşil tonları
    '#00FFFF', '#00BFFF', '#0000FF', // Mavi tonları
    '#800080', '#9370DB', '#FF00FF', // Mor tonları
    '#FFDAB9', // Şeftali
    '#A52A2A', '#8B4513', '#CD853F'  // Kahverengi tonları (yeni ekledik)
  ];

  const canvasRef = useRef(null);

  // Temizle fonksiyonu
  const clearCanvas = () => {
    setLines([]);
    setCurrentLine([]);
    setShapes([]);
    setCurrentShape(null);
  };

  // Geri al fonksiyonu - shape ve line için ayrı kontrol
  const handleUndo = () => {
    if (shapes.length > 0) {
      setShapes(prev => prev.slice(0, -1));
    } else if (lines.length > 0) {
      setLines(prev => prev.slice(0, -1));
    }
  };

  // PanResponder oluşturma
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      
      if (currentDrawMode === DRAW_MODES.SHAPE && selectedShape) {
        // Şekil çizimi başlat
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
        // Normal çizim davranışı
        const newPoint = { x: locationX, y: locationY };
        setCurrentLine([newPoint]);
      }
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      
      if (currentDrawMode === DRAW_MODES.SHAPE && currentShape) {
        // Şekil çizimi - mevcut haliyle bırakıyoruz
        setCurrentShape(prevShape => 
          prevShape ? {
            ...prevShape,
            x2: locationX,
            y2: locationY,
          } : null
        );
      } else if (currentDrawMode === DRAW_MODES.PENCIL || currentDrawMode === DRAW_MODES.ERASER) {
        // Kalem çizimi - path oluşturma için güncelliyoruz
        setCurrentLine(prevLine => {
          const newLine = [...prevLine, { x: locationX, y: locationY }];
          return newLine;
        });
      }
    },
    onPanResponderRelease: (evt) => {
      if (currentDrawMode === DRAW_MODES.SHAPE && currentShape) {
        // Tamamlanan şekli shapes dizisine ekle
        setShapes(prevShapes => [...prevShapes, currentShape]);
        setCurrentShape(null);
      } else if (currentLine.length > 0) {
        // Hem tek nokta hem de çizgi çizimini destekle
        const pathString = currentLine.length > 1 
          ? createPathFromPoints(currentLine)
          : ''; // Tek nokta için boş path
        
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

  // Path string'i oluşturma fonksiyonu
  const createPathFromPoints = (points: Point[]): string => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Pürüzsüz çizgiler için Bezier eğrisi kullanıyoruz
    for (let i = 1; i < points.length; i++) {
      // Basit bir çizgi için:
      // path += ` L ${points[i].x} ${points[i].y}`;
      
      // Daha pürüzsüz çizgi için Bezier eğrisi:
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

  // Çizim renderı
  const renderLines = () => {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        {/* Tamamlanmış çizgiler */}
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
          
          // Çizgi çizimi için
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
        
        {/* Geçerli çizim */}
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

  // Paylaşma fonksiyonu
  const handleShare = async () => {
    try {
      // Canvas'ı görüntü olarak yakala
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1
      });
      
      // Paylaş
      await Share.share({
        url: uri,
        message: 'PaintAI ile çizimim'
      });
    } catch (error) {
      Alert.alert('Paylaşma Hatası', 'Çizim paylaşılamadı.');
    }
  };

  // Çizimi kaydetme fonksiyonu
  const handleSave = async () => {
    try {
      // İzin iste
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Çizimi kaydetmek için galeri erişim izni gerekli.');
        return;
      }
      
      // Canvas'ı görüntü olarak yakala
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1
      });
      
      // Görüntüyü galeriye kaydet
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Başarılı', 'Çizim galeriye kaydedildi.');
    } catch (error) {
      Alert.alert('Kaydetme Hatası', 'Çizim kaydedilemedi.');
    }
  };

  // Araç çubuğunu gizleyip gösterebilmek için:
  useEffect(() => {
    Animated.timing(toolbarHeight, {
      toValue: toolbarVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [toolbarVisible]);

  const handleToggleTool = (isPencil: boolean, size?: number) => {
    setIsPencilActive(isPencil);
    
    // Boyut değişimi varsa uygula
    if (size) {
      setBrushSize(size);
      
      // Eğer kalem seçildiyse ve boyut değiştiyse, son kullanılan boyutları güncelle
      if (isPencil) {
        updateRecentPencilSizes(size);
      }
    }
    
    // Renk değişimi (silgi için beyaz)
    if (!isPencil) {
      // Silgi seçildiyse arkaplan rengi olarak beyazı seç
      setSelectedColor('#FFFFFF');
    } else {
      // Kalem seçildiyse en son seçilen rengi kullan veya varsayılan siyah
      if (selectedColor === '#FFFFFF') {
        setSelectedColor('#000000');
      }
    }
  };
  
  // Son kullanılan kalem boyutlarını güncelleme
  const updateRecentPencilSizes = (newSize: number) => {
    // Eğer boyut zaten listede varsa, listenin en başına taşı
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

  // Render şekiller fonksiyonu için güncellemeler
  const renderShapes = () => {
    const allShapes = [...shapes];
    if (currentShape) allShapes.push(currentShape);
    
    return allShapes.map((shape, index) => {
      const { id, type, x1, y1, x2, y2, color, strokeWidth } = shape;
      const key = `shape-${id}-${index}`;
      
      // Paint gibi şekil çizimi için mantık
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
      <AppHeader 
        onSave={handleSave}
        onShare={handleShare}
        onClear={clearCanvas}
        headerVisible={headerVisible}
        setHeaderVisible={setHeaderVisible}
      />
      
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <View style={styles.canvas} ref={canvasRef}>
          <Svg style={styles.svgCanvas} width="100%" height="100%">
            {renderLines()}
            {renderShapes()}
          </Svg>
        </View>
      </View>
      
      <DrawingToolbar
        toolbarVisible={toolbarVisible}
        selectedColor={selectedColor}
        brushSize={brushSize}
        colors={colors}
        selectedShape={selectedShape}
        setBrushSize={setBrushSize}
        setSelectedColor={setSelectedColor}
        setToolbarVisible={setToolbarVisible}
        setSelectedShape={setSelectedShape}
        currentDrawMode={currentDrawMode}
        setCurrentDrawMode={setCurrentDrawMode}
      />
      
      <ToolBar
        onUndo={handleUndo}
        onToggleTool={handleToggleTool}
        isPencilActive={isPencilActive}
        visible={!headerVisible}
        currentSize={brushSize}
        recentPencilSizes={recentPencilSizes}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Göz yormayan beyaz
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Beyaz arka plan
    margin: 0,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Beyaz arka plan
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
}); 