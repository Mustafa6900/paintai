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
  const showAlert = (title: string, message: string, buttons = [{ text: t('confirmClear.confirm'), onPress: () => { }, style: 'default' as const }]) => {
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
        showAlert(t('saveError.title'), t('saveError.message'));
        return;
      }

      showAlert(t('saveSuccess.title'), t('saveSuccess.message'));

      await new Promise(resolve => setTimeout(resolve, 200));

      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const asset = await MediaLibrary.createAssetAsync(uri);
      showAlert(t('saveSuccess.title'), t('saveSuccess.message'));
    } catch (error) {
      showAlert(t('saveError.title'), t('saveError.message'));
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
          showAlert(t('shareSuccess.title'), t('shareSuccess.message'));
        } else {
          showAlert(t('shareSuccess.title'), t('shareSuccess.message'));
        }
      } else if (result.action === Share.dismissedAction) {
        showAlert(t('shareCancel.title'), t('shareCancel.message'));
      }
    } catch (error) {
      showAlert(t('shareError.title'), t('shareError.message'));
    }
  };

  // Clear confirmation function
  const handleClearRequest = () => {
    showAlert(
      t('confirmClear.title'),
      t('confirmClear.message'),
      [
        {
          text: t('confirmClear.cancel'),
          onPress: () => { },
          style: 'default' as const
        },
        {
          text: t('confirmClear.confirm'),
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