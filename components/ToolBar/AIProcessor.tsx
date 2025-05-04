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
          <Image 
            source={{ uri: aiProcessedImage || '' }} 
            style={styles.resultImage} 
            resizeMode="contain"
          />
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]} 
              onPress={onSave}
            >
              <ThemedText style={styles.buttonText}>{t('ai.saveImage')}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.closeButton]} 
              onPress={onClose}
            >
              <ThemedText style={styles.buttonText}>{t('ai.close')}</ThemedText>
            </TouchableOpacity>
          </View>
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
    showAlert(t('save.successTitle'), t('save.successMessage'));
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
  },
  resultImage: {
    width: '100%',
    height: '90%',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#29B6F6',
  },
  closeButton: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 