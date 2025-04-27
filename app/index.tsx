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
import { DrawingToolbar } from '@/components/DrawingToolbar';
import { AppHeader } from '@/components/AppHeader';
import { ToolBar } from '@/components/ToolBar';

// Splash ekranının otomatik kapanmasını engelleme
SplashScreenModule.preventAutoHideAsync();

// Çizgi noktası tipi
interface Point {
  x: number;
  y: number;
}

// Çizgi verisi tipi
interface DrawingLine {
  points: Point[];
  color: string;
  thickness: number;
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
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const toolbarHeight = useRef(new Animated.Value(1)).current;
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isPencilActive, setIsPencilActive] = useState(true);
  
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
  };

  // Geri al fonksiyonu
  const handleUndo = () => {
    setLines(prev => prev.slice(0, -1));
  };

  // PanResponder oluşturma
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentLine([{ x: locationX, y: locationY }]);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      
      // Son noktayı al
      const lastPoint = currentLine[currentLine.length - 1];
      if (!lastPoint) return;
      
      // İlk nokta ile aynı konuma dokunulursa hareket ettirme
      if (Math.abs(locationX - lastPoint.x) < 3 && Math.abs(locationY - lastPoint.y) < 3) {
        return;
      }
      
      // Son nokta ile yeni nokta arasındaki mesafe
      const dx = locationX - lastPoint.x;
      const dy = locationY - lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 5) {
        // Çok yakın noktaları direkt ekle
        setCurrentLine(prev => [...prev, { x: locationX, y: locationY }]);
      } else {
        // Uzak noktalar için ara noktalar ekle
        const steps = Math.floor(distance / 3); // 3 piksel'de bir nokta
        const xStep = dx / steps;
        const yStep = dy / steps;
        
        const newPoints: Point[] = [];
        for (let i = 1; i <= steps; i++) {
          newPoints.push({
            x: lastPoint.x + xStep * i,
            y: lastPoint.y + yStep * i
          });
        }
        
        setCurrentLine(prev => [...prev, ...newPoints]);
      }
    },
    onPanResponderRelease: () => {
      if (currentLine.length > 0) {
        setLines(prev => [...prev, {
          points: currentLine,
          color: selectedColor,
          thickness: brushSize
        }]);
        setCurrentLine([]);
      }
    }
  });

  // Çizim renderı
  const renderLines = () => {
    return (
      <>
        {/* Tamamlanmış çizgiler */}
        {lines.map((line, lineIndex) => (
          <View key={lineIndex} style={styles.lineContainer}>
            {/* Tek nokta kontrolü */}
            {line.points.length === 1 ? (
              <View
                style={{
                  position: 'absolute',
                  left: line.points[0].x - line.thickness/2,
                  top: line.points[0].y - line.thickness/2,
                  width: line.thickness,
                  height: line.thickness,
                  borderRadius: line.thickness/2,
                  backgroundColor: line.color,
                }}
              />
            ) : (
              /* Her çizgi için tek bir path oluştur */
              buildSmoothLine(line.points, line.color, line.thickness)
            )}
          </View>
        ))}
        
        {/* Çizim sırasındaki geçerli çizgi */}
        <View style={styles.lineContainer}>
          {currentLine.length === 1 ? (
            <View
              style={{
                position: 'absolute',
                left: currentLine[0].x - brushSize/2,
                top: currentLine[0].y - brushSize/2,
                width: brushSize,
                height: brushSize,
                borderRadius: brushSize/2,
                backgroundColor: selectedColor,
              }}
            />
          ) : (
            currentLine.length > 1 && buildSmoothLine(currentLine, selectedColor, brushSize)
          )}
        </View>
      </>
    );
  };

  // Pürüzsüz çizgi oluşturma fonksiyonunu güncelleyelim
  const buildSmoothLine = (points: Point[], color: string, thickness: number) => {
    return points.map((point: Point, index: number) => {
      if (index === 0) return null;
      
      const prevPoint = points[index - 1];
      const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x);
      const distance = Math.sqrt(
        Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
      );
      
      return (
        <View 
          key={index} 
          style={{
            position: 'absolute',
            left: prevPoint.x,
            top: prevPoint.y,
            width: distance + 2,
            height: thickness,
            backgroundColor: color,
            borderRadius: thickness / 2, // Her zaman yuvarlak
            transform: [
              { translateX: 0 },
              { translateY: -thickness / 2 },
              { rotate: `${angle}rad` },
            ],
            zIndex: index
          }} 
        />
      );
    });
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

  const handleToggleTool = () => {
    setIsPencilActive(!isPencilActive);
    // Kalem ve silgi arasında geçiş
  };

  return (
    <ThemedView style={styles.container}>
      {/* Yeni AppHeader bileşenini kullanıyoruz */}
      <AppHeader 
        onSave={handleSave}
        onShare={handleShare}
        onClear={clearCanvas}
        headerVisible={headerVisible}
        setHeaderVisible={setHeaderVisible}
      />
      
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <View style={styles.canvas} ref={canvasRef}>
          {renderLines()}
        </View>
      </View>
      
      {/* DrawingToolbar bileşenini kullanıyoruz */}
      <DrawingToolbar
        toolbarVisible={toolbarVisible}
        selectedColor={selectedColor}
        brushSize={brushSize}
        colors={colors}
        setBrushSize={setBrushSize}
        setSelectedColor={setSelectedColor}
        setToolbarVisible={setToolbarVisible}
      />
      
      {/* Araç Çubuğu - Header gizlendiğinde görünür */}
      <ToolBar
        onUndo={handleUndo}
        onToggleTool={handleToggleTool}
        isPencilActive={isPencilActive}
        visible={!headerVisible}
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
}); 