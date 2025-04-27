import React from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { t } from '@/locales';

interface SettingsMenuProps {
  visible: boolean;
  animation: Animated.Value;
  top: number;
  onSave: () => void;
  onShare: () => void;
  onClear: () => void;
}

export function SettingsMenu({
  visible,
  animation,
  top,
  onSave,
  onShare,
  onClear
}: SettingsMenuProps) {
  return (
    <Animated.View 
      style={[
        styles.settingsMenu,
        {
          opacity: animation,
          width: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 170]
          }),
          right: 55,
          top,
          display: visible ? 'flex' : 'none'
        }
      ]}
    >
      <View style={styles.settingsWrapper}>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={onSave}
        >
          <ThemedText style={styles.settingsButtonIcon}>💾</ThemedText>
          <ThemedText style={styles.settingsButtonText}>{t('save')}</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={onShare}
        >
          <ThemedText style={styles.settingsButtonIcon}>🚀</ThemedText>
          <ThemedText style={styles.settingsButtonText}>{t('share')}</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={onClear}
        >
          <ThemedText style={styles.settingsButtonIcon}>🗑️</ThemedText>
          <ThemedText style={styles.settingsButtonText}>{t('clear')}</ThemedText>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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