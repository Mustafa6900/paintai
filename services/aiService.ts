import { captureRef } from 'react-native-view-shot';
import { AI_STYLES } from '@/types';
import * as FileSystem from 'expo-file-system';

const PAINTAI_API_URL = 'https://huggingface.co/spaces/owerlord7/PaintAi';

interface AIProcessResult {
  success: boolean;
  imageUri?: string;
  error?: string;
}

async function imageToBase64(uri: string): Promise<string> {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

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

async function sendToPaintAI(imageBase64: string, styleId: string): Promise<string> {
  const prompt = getPromptForStyle(styleId);

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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PaintAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.image_base64) {
    throw new Error('Missing image_base64 in response');
  }

  return base64ToUri(data.image_base64);
}

function base64ToUri(base64Data: string): string {
  if (base64Data.startsWith('data:image')) {
    return base64Data;
  }
  return `data:image/png;base64,${base64Data}`;
}

export async function processAIStyle(
  canvasRef: React.RefObject<any>,
  styleId: string
): Promise<AIProcessResult> {
  try {
    const uri = await captureRef(canvasRef, { format: 'png', quality: 1, result: 'tmpfile' });
    const base64 = await imageToBase64(uri);
    const imageUri = await sendToPaintAI(base64, styleId);
    return { success: true, imageUri };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export function getStyleName(styleId: string): string {
  return AI_STYLES.find((s) => s.id === styleId)?.name || 'Unknown Style';
}
