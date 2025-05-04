import { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Animated, 
  ScrollView, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { AIStyle, imageLoadingCache } from '@/types';
import { ThemedText } from '@/components/ThemedText';

// AI Stil Seçeneği Bileşeni
const AIStyleOption = ({ style, onSelect }: { style: AIStyle, onSelect: () => void }) => {
  const cachedState = imageLoadingCache[style.id] || { loaded: false, error: false };
  
  const [isLoading, setIsLoading] = useState(!cachedState.loaded);
  const [hasError, setHasError] = useState(cachedState.error);

  return (
    <TouchableOpacity 
      style={styles.aiStyleOption} 
      onPress={onSelect}
    >
      {isLoading && (
        <View style={styles.aiStyleIconPlaceholder}>
          <ActivityIndicator size="large" color="#FFC107" />
        </View>
      )}
      <Image 
        source={style.icon} 
        style={[
          styles.aiStyleIcon,
          isLoading ? { height: 0 } : null
        ]} 
        resizeMode="cover"
        onLoad={() => {
          imageLoadingCache[style.id] = { loaded: true, error: false };
          setIsLoading(false);
        }}
        onError={() => {
          imageLoadingCache[style.id] = { loaded: true, error: true };
          setIsLoading(false);
          setHasError(true);
        }}
      />
      {hasError && (
        <View style={styles.aiStyleIconFallback}>
          <ThemedText style={styles.aiStyleName}>{style.name}</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface AIStylesMenuProps {
  visible: boolean;
  animation: Animated.Value;
  top: number;
  aiStyles: AIStyle[];
  onSelectStyle: (styleId: string) => void;
}

export function AIStylesMenu({
  visible,
  animation,
  top,
  aiStyles,
  onSelectStyle
}: AIStylesMenuProps) {
  return (
    <Animated.View 
      style={[
        styles.aiStylesMenu,
        {
          opacity: animation,
          width: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 250]
          }),
          right: 55,
          top,
          display: visible ? 'flex' : 'none'
        }
      ]}
    >
      <ScrollView contentContainerStyle={styles.aiStylesWrapper}>
        {aiStyles.map((style) => (
          <AIStyleOption 
            key={`ai-style-option-${style.id}`}
            style={style} 
            onSelect={() => onSelectStyle(style.id)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  aiStylesMenu: {
    position: 'absolute',
    backgroundColor: '#E1F5FE',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: '#29B6F6',
    marginRight: 10,
    overflow: 'hidden',
    maxHeight: 300,
  },
  aiStylesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  aiStyleOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    margin: 5,
  },
  aiStyleIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  aiStyleIconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#FFECB3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  aiStyleIconFallback: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#29B6F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0288D1',
  },
  aiStyleName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 2,
  }
}); 