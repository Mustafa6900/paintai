interface TextContent {
  ok: string;
  save: {
    title: string;
    successTitle: string;
    successMessage: string;
    errorTitle: string;
    errorMessage: string;
  };
  share: {
    title: string;
    successTitle: string;
    successMessage: string;
    errorTitle: string;
    errorMessage: string;
    shareTitle: string;
    shareMessage: string;
  };
  imageUpload: {
    title: string;
    message: string;
    successTitle: string;
    successMessage: string;
    errorTitle: string;
    errorMessage: string;
    requestPermissionTitle: string;
    requestPermissionMessage: string;
    requestPermissionErrorTitle: string;
    requestPermissionErrorMessage: string;
  };
  clear: {
    title: string;
    confirmTitle: string;
    confirmMessage: string;
    confirm: string;
    cancel: string;
  };
  ai: {
    title: string;
    processingTitle: string;
    processingMessage: string;
    processingHint: string;
    successTitle: string;
    successMessage: string;
    errorTitle: string;
    errorMessage: string;
    networkErrorTitle: string;
    networkErrorMessage: string;
    timeoutTitle: string;
    timeoutMessage: string;
    saveResult: string;
    discard: string;
    saveSuccessTitle: string;
    saveSuccessMessage: string;
  };
}

interface Localization {
  tr: TextContent;
  en: TextContent;
}

export const texts: Localization = {
  tr: {
    ok: 'Tamam',
    save: {
      title: 'Kaydet',
      successTitle: 'Başarılı',
      successMessage: 'Çizim kaydedildi.',
      errorTitle: 'Hata',
      errorMessage: 'Çizim kaydedilemedi.'
    },
    share: {
      title: 'Paylaş',
      successTitle: 'Başarılı',
      successMessage: 'Çizim paylaşıldı.',
      errorTitle: 'Hata',
      errorMessage: 'Çizim paylaşılamadı.',
      shareTitle: 'Çizimimi Paylaş',
      shareMessage: 'PaintAI ile çizimim'
    },
    imageUpload: {
      title: 'Resim Ekle',
      message: 'Lütfen eklemek istediğiniz resmi seçin',
      successTitle: 'Başarılı',
      successMessage: 'Resim başarıyla eklendi!',
      errorTitle: 'Hata',
      errorMessage: 'Resim ekleme hatası!',
      requestPermissionTitle: 'Galeri erişim izni iste',
      requestPermissionMessage: 'Resim eklemek için galeri erişim izni gereklidir.',
      requestPermissionErrorTitle: 'Hata',
      requestPermissionErrorMessage: 'Resim eklemek için galeri erişim izni gereklidir.'
    },
    clear: {
      title: 'Temizle',
      confirmTitle: 'Tüm çizimleri temizle',
      confirmMessage: 'Tüm çizimleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      confirm: 'Evet, temizle',
      cancel: 'İptal'
    },
    ai: {
      title: 'AI Dönüşüm',
      processingTitle: 'İşleniyor',
      processingMessage: '{style} stilinde işleniyor...',
      processingHint: 'Bu işlem birkaç dakika sürebilir. Lütfen bekleyin.',
      successTitle: 'Tamamlandı',
      successMessage: 'AI dönüşümü başarıyla tamamlandı!',
      errorTitle: 'Hata',
      errorMessage: 'AI dönüşümü sırasında bir hata oluştu.',
      networkErrorTitle: 'Bağlantı Hatası',
      networkErrorMessage: 'İnternet bağlantınızı kontrol edip tekrar deneyin.',
      timeoutTitle: 'Zaman Aşımı',
      timeoutMessage: 'İşlem çok uzun sürdü. Lütfen daha sonra tekrar deneyin.',
      saveResult: 'Sonucu Kaydet',
      discard: 'İptal Et',
      saveSuccessTitle: 'AI Görüntü Kaydedildi',
      saveSuccessMessage: 'AI tarafından oluşturulan görüntü galeriye kaydedildi.',
    }
  },
  en: {
    ok: 'OK',
    save: {
      title: 'Save',
      successTitle: 'Success',
      successMessage: 'Drawing saved successfully.',
      errorTitle: 'Error',
      errorMessage: 'Drawing could not be saved.'
    },
    share: {
      title: 'Share',
      successTitle: 'Success',
      successMessage: 'Drawing shared successfully.',
      errorTitle: 'Error',
      errorMessage: 'Drawing could not be shared.',
      shareTitle: 'Share My Drawing',
      shareMessage: 'My drawing with PaintAI'
    },
    imageUpload: {
      title: 'Add Image',
      message: 'Please select the image you want to add',
      requestPermissionTitle: 'Request Gallery Access',
      successTitle: 'Success',
      successMessage: 'Image added successfully.',
      errorTitle: 'Error',
      errorMessage: 'Image upload error!',
      requestPermissionMessage: 'Gallery access is required to add images.',
      requestPermissionErrorTitle: 'Error',
      requestPermissionErrorMessage: 'Gallery access is required to add images.'
    },
    clear: {
      title: 'Clear',
      confirmTitle: 'Clear all drawings',
      confirmMessage: 'Are you sure you want to clear all drawings? This action cannot be undone.',
      confirm: 'Yes, clear',
      cancel: 'Cancel'
    },
    ai: {
      title: 'AI Transformation',
      processingTitle: 'Processing',
      processingMessage: 'Processing in {style} style...',
      processingHint: 'This may take a few minutes. Please wait.',
      successTitle: 'Completed',
      successMessage: 'AI transformation completed successfully!',
      errorTitle: 'Error',
      errorMessage: 'An error occurred during AI transformation.',
      networkErrorTitle: 'Connection Error',
      networkErrorMessage: 'Please check your internet connection and try again.',
      timeoutTitle: 'Timeout',
      timeoutMessage: 'The process took too long. Please try again later.',
      saveResult: 'Save Result',
      discard: 'Discard',
      saveSuccessTitle: 'AI Image Saved',
      saveSuccessMessage: 'AI generated image has been saved to gallery.',
    }
  }
};

// Default language setting used at application startup
export const defaultLanguage = 'en';

// Language state management
export let currentLanguage = defaultLanguage;

export const setLanguage = (lang: 'tr' | 'en') => {
  currentLanguage = lang;
};

export const t = (key: string, params?: Record<string, string>) => {
  const keys = key.split('.');
  let value: any = texts[currentLanguage as keyof typeof texts];

  for (const k of keys) {
    if (value[k] === undefined) {
      return key;
    }
    value = value[k];
  }

  if (params && typeof value === 'string') {
    Object.keys(params).forEach(paramKey => {
      value = value.replace(`{${paramKey}}`, params[paramKey]);
    });
  }

  return value;
}; 