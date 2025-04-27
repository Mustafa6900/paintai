interface TextContent {
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
}

interface Localization {
  tr: TextContent;
  en: TextContent;
}

export const texts: Localization = {
  tr: {
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
    }
  },
  en: {
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

export const t = (key: string) => {
  const keys = key.split('.');
  let value: any = texts[currentLanguage as keyof typeof texts];

  for (const k of keys) {
    if (value[k] === undefined) {
      return key;
    }
    value = value[k];
  }

  return value;
}; 