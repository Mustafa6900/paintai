import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { ThemedText } from '@/components/ThemedText';
import { t } from '@/locales';

interface AIProcessorProps {
  aiProcessedImage: string | null;
  isLoading: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  showAlert: (title: string, message: string, buttons?: any[]) => void;
}

export function AIProcessor({
  aiProcessedImage,
  isLoading,
  onClose,
  onSave,
  showAlert
}: AIProcessorProps) {
  
  if (!aiProcessedImage && !isLoading) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#29B6F6" />
          <ThemedText style={styles.loadingText}>{t('ai.processingStatus')}</ThemedText>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <View style={styles.topButtonsContainer}>
            <TouchableOpacity 
              style={[styles.iconButton, styles.saveButton]} 
              onPress={onSave}
            >
              <ThemedText style={styles.iconButtonText}>💾</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, styles.closeButton]} 
              onPress={onClose}
            >
              <ThemedText style={styles.iconButtonText}>✖</ThemedText>
            </TouchableOpacity>
          </View>
          
          <Image 
            source={{ uri: aiProcessedImage || '' }} 
            style={styles.resultImage} 
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
}

export async function handleSaveAIImage(
  aiProcessedImage: string | null, 
  showAlert: (title: string, message: string, buttons?: any[]) => void, 
  onImageSaved: () => void
) {
  if (!aiProcessedImage) return;
  
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      showAlert(t('save.errorTitle'), t('save.errorMessage'));
      return;
    }
    
    await MediaLibrary.createAssetAsync(aiProcessedImage);
    onImageSaved();
    showAlert(t('ai.saveSuccessTitle'), t('ai.saveSuccessMessage'));
  } catch (error) {
    showAlert(t('save.errorTitle'), t('save.errorMessage'));
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  processingTip: {
    marginTop: 10,
    fontSize: 14,
    color: 'gray',
  },
  resultContainer: {
    width: '90%',
    height: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    position: 'relative',
  },
  topButtonsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 100,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: '#FFECB3',
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  iconButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
}); 