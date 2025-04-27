import { useState, useRef } from 'react';
import { Share, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { AlertConfig } from '@/types';
import { t } from '@/locales';

export function useCanvasShare(clearCanvas: () => void) {
  const canvasRef = useRef(null);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    onDismiss: () => { }
  });

  // Alert function
  const showAlert = (title: string, message: string, buttons = [{ text: t('clear.confirm'), onPress: () => { }, style: 'default' as const }]) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons,
      onDismiss: () => setAlertConfig(prev => ({ ...prev, visible: false }))
    });
  };

  // Save function
  const handleSave = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== 'granted') {
        showAlert(t('save.errorTitle'), t('save.errorMessage'));
        return;
      }

      showAlert(t('save.successTitle'), t('save.successMessage'));

      await new Promise(resolve => setTimeout(resolve, 200));

      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const asset = await MediaLibrary.createAssetAsync(uri);
      showAlert(t('save.successTitle'), t('save.successMessage'));
    } catch (error) {
      showAlert(t('save.errorTitle'), t('save.errorMessage'));
    }
  };

  // Share function
  const handleShare = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      // Platform check
      let shareOptions;
      if (Platform.OS === 'ios') {
        // iOS 
        shareOptions = {
          url: uri,
          message: 'PaintAI ile çizimim'
        };
      } else {
        // Android 
        shareOptions = {
          title: 'Çizimimi Paylaş',
          message: 'PaintAI ile çizimim',
          url: uri
        };
      }

      // Share
      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          showAlert(t('share.successTitle'), t('share.successMessage'));
        } else {
          showAlert(t('share.successTitle'), t('share.successMessage'));
        }
      } else if (result.action === Share.dismissedAction) {
        showAlert(t('share.errorTitle'), t('share.errorMessage'));
      }
    } catch (error) {
      showAlert(t('share.errorTitle'), t('share.errorMessage'));
    }
  };

  // Clear confirmation function
  const handleClearRequest = () => {
    showAlert(
      t('clear.confirmTitle'),
      t('clear.confirmMessage'),
      [
        {
          text: t('clear.cancel'),
          onPress: () => { },
          style: 'default' as const
        },
        {
          text: t('clear.confirm'),
          onPress: clearCanvas,
          style: 'default' as const
        }
      ]
    );
  };

  return {
    canvasRef,
    alertConfig,
    showAlert,
    handleSave,
    handleShare,
    handleClearRequest
  };
} 