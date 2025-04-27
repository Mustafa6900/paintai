import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Animated,
  Dimensions,
  LayoutChangeEvent
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface ToolBarProps {
  onUndo: () => void;
  onToggleTool: (isPencil: boolean, size?: number) => void;
  isPencilActive: boolean;
  visible: boolean;
  currentSize: number;
  recentPencilSizes: number[];
}

export function ToolBar({ 
  onUndo, 
  onToggleTool, 
  isPencilActive,
  visible,
  currentSize,
  recentPencilSizes = [5, 10, 15] // Varsayılan değerler
}: ToolBarProps) {
  const [showPencilSizes, setShowPencilSizes] = useState(false);
  const [showEraserSizes, setShowEraserSizes] = useState(false);
  
  // Buton yükseklikleri için referanslar
  const pencilButtonRef = useRef<View>(null);
  const eraserButtonRef = useRef<View>(null);
  
  // Buton pozisyonları için
  const [pencilButtonTop, setPencilButtonTop] = useState(0);
  const [eraserButtonTop, setEraserButtonTop] = useState(0);
  
  const pencilSizeAnimation = new Animated.Value(0);
  const eraserSizeAnimation = new Animated.Value(0);
  
  // Pencere genişliğini al
  const windowWidth = Dimensions.get('window').width;
  
  // Silgi boyutları
  const eraserSizes = [10, 20, 30];
  
  // Her araç değişikliğinde, uygun boyut menüsünün gösterilmesi için
  useEffect(() => {
    // Kalem aktifse ve ilk kez değiştiyse
    if (isPencilActive) {
      setShowEraserSizes(false);
      setShowPencilSizes(true);
    } else {
      // Silgi aktifse ve ilk kez değiştiyse
      setShowPencilSizes(false);
      setShowEraserSizes(true);
    }
  }, [isPencilActive]);
  
  useEffect(() => {
    // Pencil menü animasyonu
    Animated.timing(pencilSizeAnimation, {
      toValue: showPencilSizes ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
    
    // Eraser menü animasyonu
    Animated.timing(eraserSizeAnimation, {
      toValue: showEraserSizes ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  }, [showPencilSizes, showEraserSizes]);
  
  // Kalem butonun pozisyonunu ölçmek için
  const onPencilButtonLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setPencilButtonTop(y + height/2 - 20); // Menünün ortası butonun ortasına hizalanacak
  };
  
  // Silgi butonun pozisyonunu ölçmek için
  const onEraserButtonLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setEraserButtonTop(y + height/2 - 20); // Menünün ortası butonun ortasına hizalanacak
  };
  
  // Görsel boyut skalası (gerçek değeri korurken görsel boyutu uygun şekilde ölçeklendirmek için)
  const getVisualSize = (size: number, eraser: boolean = false) => {
    if (eraser) {
      // Silgi için özel ölçeklendirme
      if (size === 10) return 10;
      if (size === 20) return 15;
      if (size === 30) return 20;
    }
    // Kalem için orijinal ölçeklendirme
    return Math.min(size, 20);
  };
  
  // Kalem tıklama
  const handlePencilPress = () => {
    if (!isPencilActive) {
      // Silgiden kaleme geçiş - state değişikliği useEffect'le boyut menüsünü açacak
      onToggleTool(true);
    } else {
      // Kalem zaten aktifse boyut menüsünü göster/gizle
      setShowPencilSizes(!showPencilSizes);
    }
  };
  
  // Silgi tıklama
  const handleEraserPress = () => {
    if (isPencilActive) {
      // Kalemden silgiye geçiş - state değişikliği useEffect'le boyut menüsünü açacak
      onToggleTool(false);
    } else {
      // Silgi zaten aktifse boyut menüsünü göster/gizle
      setShowEraserSizes(!showEraserSizes);
    }
  };
  
  // Kalem boyutu seçme
  const selectPencilSize = (size: number) => {
    onToggleTool(true, size);
    // Boyut seçildiğinde menüyü kapatalım
    setShowPencilSizes(false);
  };
  
  // Silgi boyutu seçme
  const selectEraserSize = (size: number) => {
    onToggleTool(false, size);
    // Boyut seçildiğinde menüyü kapatalım
    setShowEraserSizes(false);
  };
  
  return (
    <View style={styles.mainContainer}>
      {/* Kalem boyut menüsü */}
      <Animated.View 
        style={[
          styles.sizeMenu,
          {
            opacity: pencilSizeAnimation,
            width: pencilSizeAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 120]
            }),
            right: 55,
            top: pencilButtonTop,
            display: showPencilSizes ? 'flex' : 'none'
          }
        ]}
      >
        {recentPencilSizes.map((size, index) => (
          <TouchableOpacity 
            key={`pencil-${index}`}
            style={[
              styles.sizeButton, 
              size === currentSize && isPencilActive ? styles.activeSizeButton : null
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
                }
              ]} 
            />
          </TouchableOpacity>
        ))}
      </Animated.View>
      
      {/* Silgi boyut menüsü */}
      <Animated.View 
        style={[
          styles.sizeMenu,
          {
            opacity: eraserSizeAnimation,
            width: eraserSizeAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 120]
            }),
            right: 55,
            top: eraserButtonTop,
            display: showEraserSizes ? 'flex' : 'none'
          }
        ]}
      >
        {eraserSizes.map((size, index) => (
          <TouchableOpacity 
            key={`eraser-${index}`}
            style={[
              styles.sizeButton,
              size === currentSize && !isPencilActive ? styles.activeSizeButton : null
            ]} 
            onPress={() => selectEraserSize(size)}
          >
            {/* Silgi boyut göstergesi - içi boş daire */}
            <View 
              style={[
                styles.eraserSizeBorder, 
                { 
                  width: getVisualSize(size, true), 
                  height: getVisualSize(size, true),
                  borderWidth: 2,
                }
              ]} 
            />
          </TouchableOpacity>
        ))}
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
  sizeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 25,
    height: 25,
    borderRadius: 10,
    marginHorizontal: 2,
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
    borderColor: '#fff',
  },
  sizeText: {
    fontSize: 9,
    marginTop: 1,
    color: '#333333',
    fontWeight: 'bold',
  }
}); 