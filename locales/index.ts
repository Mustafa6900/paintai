interface TextContent {
  confirmClear: {
    title: string;
    message: string;
    confirm: string;
    cancel: string;
  };
  saveSuccess: {
    title: string;
    message: string;
  };
  saveError: {
    title: string;
    message: string;
  };
}

interface Localization {
  tr: TextContent;
  en: TextContent;
}

export const texts: Localization = {
  tr: {
    confirmClear: {
      title: 'Tüm çizimleri temizle',
      message: 'Tüm çizimleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      confirm: 'Evet, temizle',
      cancel: 'İptal'
    },
    saveSuccess: {
      title: 'Başarılı',
      message: 'Çizim galeriye kaydedildi.'
    },
    saveError: {
      title: 'Kaydetme Hatası',
      message: 'Çizim kaydedilemedi.'
    }
  },
  en: {
    confirmClear: {
      title: 'Clear all drawings',
      message: 'Are you sure you want to clear all drawings? This action cannot be undone.',
      confirm: 'Yes, clear',
      cancel: 'Cancel'
    },
    saveSuccess: {
      title: 'Success',
      message: 'Drawing saved to gallery.'
    },
    saveError: {
      title: 'Save Error',
      message: 'Drawing could not be saved.'
    }
  }
};

// Default language setting used at application startup
export const defaultLanguage = 'tr';

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
      return key; // Return key if translation not found
    }
    value = value[k];
  }

  return value;
}; 