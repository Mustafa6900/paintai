interface TextContent {
  confirmClear: {
    title: string;
    message: string;
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
    confirmClear: {
      title: 'Tüm çizimleri temizle',
      message: 'Tüm çizimleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      confirm: 'Evet, temizle',
      cancel: 'İptal'
    }
  },
  en: {
    confirmClear: {
      title: 'Clear all drawings',
      message: 'Are you sure you want to clear all drawings? This action cannot be undone.',
      confirm: 'Yes, clear',
      cancel: 'Cancel'
    }
  }
};

// Varsayılan dil ayarı (uygulama başlatıldığında kullanılacak)
export const defaultLanguage = 'tr';

// Aktif dil için bir store/context kullanılabilir
// Bu basit bir örnek:
export let currentLanguage = defaultLanguage;

export const setLanguage = (lang: 'tr' | 'en') => {
  currentLanguage = lang;
};

export const t = (key: string) => {
  const keys = key.split('.');
  let value: any = texts[currentLanguage as keyof typeof texts];

  for (const k of keys) {
    if (value[k] === undefined) {
      return key; // Eğer çeviri yoksa key'i döndür
    }
    value = value[k];
  }

  return value;
}; 