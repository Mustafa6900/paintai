import React, { useEffect } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import * as SplashScreenModule from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { CustomAlert } from '@/components/CustomAlert';
import { Canvas } from '@/components/Canvas';
import { ToolBar } from '@/components/ToolBar';
import { useDrawing } from '@/hooks/useDrawing';
import { useTools } from '@/hooks/useTools';
import { useCanvasShare } from '@/hooks/useCanvasShare';

SplashScreenModule.preventAutoHideAsync();

export default function DrawingScreen() {
  // Çizim ile ilgili hook'lar
  const {
    lines,
    currentLine,
    shapes,
    currentShape,
    createPathFromPoints,
    clearCanvas,
    handleUndo,
    createPanResponder
  } = useDrawing();

  // Araçlarla ilgili hook'lar
  const {
    selectedColor,
    setSelectedColor,
    brushSize,
    toolbarVisible,
    isPencilActive,
    selectedShape,
    setSelectedShape,
    currentDrawMode,
    setCurrentDrawMode,
    colors,
    handleToggleTool
  } = useTools();

  // Paylaşım ve kaydetme hook'u
  const {
    canvasRef,
    alertConfig,
    handleSave,
    handleShare,
    handleClearRequest
  } = useCanvasShare(clearCanvas);

  // Dokunmatik olayları kontrol eden panResponder'ı oluştur
  const panResponder = createPanResponder(
    currentDrawMode,
    selectedShape,
    selectedColor,
    brushSize
  );

  // Fontları yükle
  const [fontsLoaded] = useFonts({
    // Buraya kullanılan fontlar eklenebilir
  });

  // Splash ekranını kapat
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreenModule.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      {/* Çizim Alanı */}
      <Canvas
        canvasRef={canvasRef}
        lines={lines}
        currentLine={currentLine}
        shapes={shapes}
        currentShape={currentShape}
        createPathFromPoints={createPathFromPoints}
        currentDrawMode={currentDrawMode}
        selectedColor={selectedColor}
        brushSize={brushSize}
        panHandlers={panResponder.panHandlers}
      />
      
      {/* Araç Çubuğu */}
      <ToolBar
        onUndo={handleUndo}
        onToggleTool={handleToggleTool}
        currentDrawMode={currentDrawMode}
        setCurrentDrawMode={setCurrentDrawMode}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        colors={colors}
        brushSize={brushSize}
        visible={toolbarVisible}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        onSave={handleSave}
        onShare={handleShare}
        onClear={handleClearRequest}
      />
      
      {/* Uyarı Diyaloğu */}
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
  }
}); 