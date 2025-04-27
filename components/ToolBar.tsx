import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Animated
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface ToolBarProps {
  onUndo: () => void;
  onToggleTool: () => void;
  isPencilActive: boolean;
  visible: boolean;
}

export function ToolBar({ 
  onUndo, 
  onToggleTool, 
  isPencilActive,
  visible 
}: ToolBarProps) {
  return (
    <Animated.View style={[
      styles.container,
      { opacity: visible ? 1 : 0 }
    ]}>
      <TouchableOpacity style={styles.toolButton} onPress={onUndo}>
        <ThemedText style={styles.toolButtonIcon}>↩️</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.toolButton, 
          isPencilActive ? styles.activeToolButton : null
        ]} 
        onPress={() => isPencilActive ? null : onToggleTool()}
      >
        <ThemedText style={styles.toolButtonIcon}>✏️</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.toolButton, 
          !isPencilActive ? styles.activeToolButton : null
        ]} 
        onPress={() => isPencilActive ? onToggleTool() : null}
      >
        <ThemedText style={styles.toolButtonIcon}>🧽</ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 5,
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
}); 