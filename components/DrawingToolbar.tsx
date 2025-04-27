import React, { useRef, useEffect, useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Platform, 
  Animated,
  ScrollView,
  PanResponder,
  Dimensions,
  Image
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface DrawingToolbarProps {
  toolbarVisible: boolean;
  selectedColor: string;
  brushSize: number;
  colors: string[];
  setBrushSize: (size: number) => void;
  setSelectedColor: (color: string) => void;
  setToolbarVisible: (visible: boolean) => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DRAG_THRESHOLD = 50; // Kaç piksel sürüklenince kapanacak/açılacak

export function DrawingToolbar({ 
  toolbarVisible, 
  selectedColor, 
  brushSize, 
  colors,
  setBrushSize, 
  setSelectedColor,
  setToolbarVisible
}: DrawingToolbarProps) {
  const toolbarHeight = useRef(new Animated.Value(toolbarVisible ? 1 : 0)).current;
  const [panStartY, setPanStartY] = useState(0);
  
  // PanResponder oluşturalım
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setPanStartY(evt.nativeEvent.pageY);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Sürükleme sırasında toolbar'ı anında hareket ettirmek için
      // Burada doğrudan bir şey yapmıyoruz, sadece kullanıcı deneyimini iyileştirmek için
      // gestureState.dy kullanılabilir
    },
    onPanResponderRelease: (evt, gestureState) => {
      const dragDistance = gestureState.dy;
      
      // Aşağı sürükleme - toolbar'ı kapat
      if (dragDistance > DRAG_THRESHOLD && toolbarVisible) {
        setToolbarVisible(false);
      } 
      // Yukarı sürükleme - toolbar'ı aç
      else if (dragDistance < -DRAG_THRESHOLD && !toolbarVisible) {
        setToolbarVisible(true);
      }
    }
  });
  
  useEffect(() => {
    Animated.timing(toolbarHeight, {
      toValue: toolbarVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [toolbarVisible]);

  return (
    <>
      <Animated.View 
        style={[
          styles.toolbar, 
          {
            maxHeight: toolbarHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 300]
            })
          }
        ]}>
        {/* Sürüklenebilir tutamak */}
        <View 
          style={styles.dragHandle} 
          {...panResponder.panHandlers}
        >
          <View style={styles.dragIndicator} />
        </View>
        
        <ScrollView>
          <View style={styles.toolbarContent}>
            {/* Fırça Boyutu */}
            <View style={styles.toolbarSection}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionIcon}>🖌️</ThemedText>
              </View>
              <View style={styles.brushSizeContainer}>
                {[3, 6, 8, 10, 12, 15, 20, 25, 30].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.brushSizeOption,
                      brushSize === size && styles.selectedBrushSize
                    ]}
                    onPress={() => setBrushSize(size)}
                  >
                    <View 
                      style={{
                        width: Math.min(size, 30),
                        height: Math.min(size, 30),
                        borderRadius: size/2,
                        backgroundColor: selectedColor
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          
            {/* Renk Paleti */}
            <View style={styles.toolbarSection}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionIcon}>🎨</ThemedText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScrollView}>
                <View style={styles.colorPalette}>
                  {colors.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedColor
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
      
      {/* Toolbar KAPALI olduğunda gösterilecek açma butonu */}
      {!toolbarVisible && (
        <TouchableOpacity 
          style={styles.showToolbarButton}
          onPress={() => setToolbarVisible(true)}
        >
          <ThemedText style={styles.showToolbarButtonText}>▲</ThemedText>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    padding: 0,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    backgroundColor: '#FFF9C4', // Pastel sarı arka plan
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFC107', // Altın sarısı çerçeve
    borderStyle: 'dashed', // Kesikli çerçeve çocuksu görünüm için
  },
  dragHandle: {
    width: '100%',
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: '#FFF9C4', // Altın sarısı
    borderTopWidth: 1.5,
    borderTopColor: '#FFB300', // Daha koyu sarı
    borderStyle: 'solid',
  },
  dragIndicator: {
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#FFB300', // Beyaz gösterge
  },
  toolbarContent: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  toolbarSection: {
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFB300',
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    width: '85%',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionIcon: {
    fontSize: 26, // Daha büyük ikonlar
    color: '#FF5722', // Turuncu renk
  },
  brushSizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 4.5,
    marginBottom: 3,
  },
  brushSizeOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    margin: 3,
  },
  selectedBrushSize: {
    borderColor: '#FF5722', // Turuncu çerçeve seçiliyi belirtmek için
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
    backgroundColor: '#FFF3E0', // Hafif turuncu arka plan
  },
  colorScrollView: {
    marginBottom: 5,
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 2.7,
    paddingVertical: 3,
  },
  colorOption: {
    width: 23,
    height: 23,
    borderRadius: 11.5,
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
    borderColor: '#FF5722', // Turuncu
    transform: [{ scale: 1.1 }],
  },
  showToolbarButton: {
    position: 'absolute',
    bottom: 0,
    left: '90%',
    marginLeft: -25,
    width: 50,
    height: 22,
    backgroundColor: '#FFF9C4',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#FFC107',
    zIndex: 10,
  },
  showToolbarButtonText: {
    fontSize: 14,
    color: '#FFC107',
    fontWeight: 'bold',
  }
}); 