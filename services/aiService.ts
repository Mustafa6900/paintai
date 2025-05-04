import { captureRef } from 'react-native-view-shot';
import { AI_STYLES } from '@/types';

interface AIProcessResult {
  success: boolean;
  imageUri?: string;
  error?: string;
}

export async function processAIStyle(
  canvasRef: React.RefObject<any>,
  styleId: string
): Promise<AIProcessResult> {
  try {
    // Görüntüyü yakalama
    const uri = await captureRef(canvasRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    // Gerçek bir API'ye göndermeden önce, ileride burada bir API çağrısı yapılabilir
    // Örnek API çağrısı:
    // const response = await fetch('https://your-ai-api.com/process', {
    //   method: 'POST',
    //   body: JSON.stringify({ imageUri: uri, styleId }),
    //   headers: { 'Content-Type': 'application/json' }
    // });
    // const data = await response.json();

    // Şimdilik demo olarak gecikme ekleyelim ve orijinal resmi döndürelim
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      imageUri: uri
    };

  } catch (error) {
    return {
      success: false,
      error: String(error)
    };
  }
}

// Seçilen AI stilinin adını döndürür
export function getStyleName(styleId: string): string {
  return AI_STYLES.find(style => style.id === styleId)?.name || 'Bilinmeyen Stil';
} 