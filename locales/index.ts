interface TextContent {
  save: {
    title: string;
  };
  share: {
    title: string;
  };
  clear: {
    title: string;
  };
  confirmClear: {
    title: string;
    message: string;
    confirm: string;
    cancel: string;
  };
  saveSuccess: {
    title: string;
    message: string;
    confirm: string;
  };
  saveError: {
    title: string;
    message: string;
  };
  shareSuccess: {
    title: string;
    message: string;
  };
  shareCancel: {
    title: string;
    message: string;
  };
  shareError: {
    title: string;
    message: string;
  };
  shareMessage: string;
  shareTitle: string;
}

interface Localization {
  tr: TextContent;
  en: TextContent;
}

export const texts: Localization = {
  tr: {
    save: {
      title: 'Kaydet'
    },
    share: {
      title: 'Paylaş'
    },
    clear: {
      title: 'Temizle'
    },
    confirmClear: {
      title: 'Tüm çizimleri temizle',
      message: 'Tüm çizimleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      confirm: 'Evet, temizle',
      cancel: 'İptal'
    },
    saveSuccess: {
      title: 'Başarılı',
      message: 'Çizim galeriye kaydedildi.',
      confirm: 'Tamam'
    },
    saveError: {
      title: 'Kaydetme Hatası',
      message: 'Çizim kaydedilemedi.'
    },
    shareSuccess: {
      title: 'Paylaşıldı',
      message: 'Çizim paylaşıldı.'
    },
    shareCancel: {
      title: 'İptal',
      message: 'Çizim paylaşılmadı.'
    },
    shareError: {
      title: 'Paylaşma Hatası',
      message: 'Çizim paylaşılamadı.'
    },
    shareMessage: 'PaintAI ile çizimim',
    shareTitle: 'Çizimimi Paylaş'
  },
  en: {
    save: {
      title: 'Save'
    },
    share: {
      title: 'Share'
    },
    clear: {
      title: 'Clear'
    },
    confirmClear: {
      title: 'Clear all drawings',
      message: 'Are you sure you want to clear all drawings? This action cannot be undone.',
      confirm: 'Yes, clear',
      cancel: 'Cancel'
    },
    saveSuccess: {
      title: 'Success',
      message: 'Drawing saved to gallery.',
      confirm: 'OK'
    },
    saveError: {
      title: 'Save Error',
      message: 'Drawing could not be saved.'
    },
    shareSuccess: {
      title: 'Shared',
      message: 'Drawing has been shared.'
    },
    shareCancel: {
      title: 'Cancelled',
      message: 'Drawing was not shared.'
    },
    shareError: {
      title: 'Share Error',
      message: 'Could not share drawing.'
    },
    shareMessage: 'My drawing with PaintAI',
    shareTitle: 'Share My Drawing'
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