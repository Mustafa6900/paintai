import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Platform,
  Image,
  Animated,
  PanResponder,
  Alert
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { t, currentLanguage } from '@/locales';

interface AppHeaderProps {
  onSave: () => void;
  onShare: () => void;
  onClear: () => void;
  headerVisible: boolean;
  setHeaderVisible: (visible: boolean) => void;
}

export function AppHeader({ 
  onSave, 
  onShare, 
  onClear, 
  headerVisible,
  setHeaderVisible 
}: AppHeaderProps) {
  const headerHeight = useRef(new Animated.Value(headerVisible ? 1 : 0)).current;
  
  // PanResponder oluşturuyoruz
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      // Sürükleme işlemi
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Yukarı sürüklendiğinde header'ı gizle
      if (gestureState.dy < -30 && headerVisible) {
        setHeaderVisible(false);
      }
    }
  });
  
  useEffect(() => {
    Animated.timing(headerHeight, {
      toValue: headerVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [headerVisible]);

  // Silme işlemi için onay diyaloğu
  const handleClearRequest = () => {
    Alert.alert(
      t('confirmClear.title'),
      t('confirmClear.message'),
      [
        {
          text: t('confirmClear.cancel'),
          style: 'cancel'
        },
        {
          text: t('confirmClear.confirm'),
          onPress: onClear,
          style: 'destructive'
        }
      ],
      { cancelable: true }
    );
  };
  
  return (
    <>
      <Animated.View 
        style={[
          styles.header,
          {
            maxHeight: headerHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 90]
            }),
            opacity: headerHeight
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.headerInner}>
          <View style={styles.logoContainer}>
            <ThemedText style={styles.logoText}>🎨</ThemedText>
          </View>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={onSave}>
              <ThemedText style={styles.actionButtonIcon}>💾</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onShare}>
              <ThemedText style={styles.actionButtonIcon}>🚀</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleClearRequest}>
              <ThemedText style={styles.actionButtonIcon}>🗑️</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.dragIndicatorContainer}>
          <View style={styles.dragIndicator} />
        </View>
      </Animated.View>
      
      {/* Header gizli olduğunda gösterilecek aşağı açma butonu */}
      {!headerVisible && (
        <TouchableOpacity 
          style={styles.showHeaderButton}
          onPress={() => setHeaderVisible(true)}
        >
          <ThemedText style={styles.showHeaderButtonText}>▼</ThemedText>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    overflow: 'hidden',
    backgroundColor: '#FFF9C4',
    borderBottomWidth: 2,
    borderBottomColor: '#FFC107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 10,
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD54F',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFB300',
  },
  logoText: {
    fontSize: 26,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: '#FFECB3',
    borderRadius: 20,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  actionButtonIcon: {
    fontSize: 22,
  },
  actionButtonText: {
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
  },
  dragIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFC107',
  },
  showHeaderButton: {
    position: 'absolute',
    top: 0,
    left: '90%',
    marginLeft: -25,
    width: 50,
    height: 22,
    backgroundColor: '#FFF9C4',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#FFC107',
    zIndex: 10,
  },
  showHeaderButtonText: {
    fontSize: 14,
    color: '#FFC107',
    fontWeight: 'bold',
  }
}); 