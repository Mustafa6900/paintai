import React from 'react';
import { StyleSheet, TouchableOpacity, View, Animated, ScrollView } from 'react-native';

interface ColorPaletteProps {
  visible: boolean;
  animation: Animated.Value;
  top: number;
  colors: string[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export function ColorPalette({
  visible,
  animation,
  top,
  colors,
  selectedColor,
  onSelectColor
}: ColorPaletteProps) {
  return (
    <Animated.View 
      style={[
        styles.colorPaletteMenu,
        {
          opacity: animation,
          width: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200]
          }),
          right: 55,
          top,
          display: visible ? 'flex' : 'none'
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
              onPress={() => onSelectColor(color)}
            />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  scrollMenu: {
    maxHeight: 170,
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
}); 