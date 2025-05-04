import { captureRef } from 'react-native-view-shot';
import { AI_STYLES } from '@/types';
import * as FileSystem from 'expo-file-system';

// Doğru API URL'si
const PAINTAI_API_URL = 'https://owerlord7-paintai.hf.space/controlnet';

interface AIProcessResult {
  success: boolean;
  imageUri?: string;
  error?: string;
}

async function imageToBase64(uri: string): Promise<string> {
  try {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (error) {
    console.error('Base64 dönüşüm hatası:', error);
    throw error;
  }
}

// Style prompt
function getPromptForStyle(styleId: string): string {
  const stylePrompts: Record<string, string> = {
    pixar: 'A Pixar-style 3D rendering, keep the exact same content and layout as the original drawing, high quality',
    anime: 'A Studio Ghibli anime style illustration, keep the exact same content and layout as the original drawing, high quality',
    fantasy: 'A fantasy digital artwork, keep the exact same content and layout as the original drawing, high quality',
    watercolor: 'A watercolor painting, keep the exact same content and layout as the original drawing, high quality',
    storybook: "A children's storybook illustration, keep the exact same content and layout as the original drawing, high quality",
    comic: 'A comic book art style drawing, keep the exact same content and layout as the original drawing, high quality',
    cartoon: 'A cartoon style artwork, keep the exact same content and layout as the original drawing, high quality',
    cyberpunk: 'A cyberpunk digital art, keep the exact same content and layout as the original drawing, high quality',
    pencil: 'A pencil drawing style artwork, keep the exact same content and layout as the original drawing, high quality',
  };
  return stylePrompts[styleId] || stylePrompts['pixar'];
}

// PaintAI ControlNet API 
async function sendToPaintAI(imageBase64: string, styleId: string): Promise<string> {
  const prompt = getPromptForStyle(styleId);

  console.log('API isteği gönderiliyor:', PAINTAI_API_URL);

  try {
    const response = await fetch(PAINTAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        image_base64: imageBase64,
        prompt: prompt
      })
    });

    console.log('API Yanıt Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PaintAI API isteği başarısız: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API yanıtı alındı:', data ? 'Veri mevcut' : 'Veri yok');

    if (!data.image_base64) {
      throw new Error('API yanıtında görüntü verisi bulunamadı');
    }

    return base64ToUri(data.image_base64);
  } catch (error) {
    console.error('PaintAI API hatası:', error);
    throw error;
  }
}

function base64ToUri(base64Data: string): string {
  if (base64Data.startsWith('data:image')) {
    return base64Data;
  }
  return `data:image/png;base64,${base64Data}`;
}

// Main process
export async function processAIStyle(
  canvasRef: React.RefObject<any>,
  styleId: string
): Promise<AIProcessResult> {
  try {
    // Capture the drawing
    const uri = await captureRef(canvasRef, { format: 'png', quality: 1, result: 'tmpfile' });
    console.log('Görüntü yakalandı:', uri);

    // Convert to Base64
    const base64 = await imageToBase64(uri);
    console.log('Base64 dönüşümü tamamlandı, uzunluk:', base64.length);

    // Send to PaintAI
    const imageUri = await sendToPaintAI(base64, styleId);
    return { success: true, imageUri };
  } catch (error) {
    console.error('AI işleme hatası:', error);
    return { success: false, error: String(error) };
  }
}

export function getStyleName(styleId: string): string {
  return AI_STYLES.find((s) => s.id === styleId)?.name || 'Unknown Style';
} 