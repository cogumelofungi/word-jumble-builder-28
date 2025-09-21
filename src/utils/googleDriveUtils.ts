/**
 * Utility functions for handling Google Drive video URLs
 */

export interface GoogleDriveVideoInfo {
  id: string;
  directUrl: string;
  previewUrl: string;
  embedUrl: string;
}

/**
 * Extracts Google Drive file ID from various URL formats
 */
export function extractGoogleDriveId(url: string): string | null {
  console.log('Extracting Google Drive ID from URL:', url);
  
  // Handle different Google Drive URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,  // /file/d/ID/view or /file/d/ID/edit
    /id=([a-zA-Z0-9_-]+)/,          // ?id=ID
    /\/d\/([a-zA-Z0-9_-]+)/,        // /d/ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      console.log('Found Google Drive ID:', match[1]);
      return match[1];
    }
  }

  console.log('No Google Drive ID found in URL');
  return null;
}

/**
 * Checks if a URL is a Google Drive URL
 */
export function isGoogleDriveUrl(url: string): boolean {
  const isDrive = url.includes('drive.google.com') || url.includes('docs.google.com');
  console.log('Is Google Drive URL?', isDrive, 'for URL:', url);
  return isDrive;
}

/**
 * Converts Google Drive URL to different formats for video playback
 */
export function getGoogleDriveVideoInfo(url: string): GoogleDriveVideoInfo | null {
  const id = extractGoogleDriveId(url);
  
  if (!id) {
    console.log('Cannot get Google Drive video info: no ID found');
    return null;
  }

  const info = {
    id,
    // Direct download URL - works best with HTML5 video element
    directUrl: `https://drive.google.com/uc?id=${id}&export=download`,
    // Streaming URL - alternative direct URL (this is what we'll use)
    previewUrl: `https://drive.google.com/file/d/${id}/preview`,
    // Embed URL - for iframe embedding
    embedUrl: `https://drive.google.com/file/d/${id}/preview`,
  };

  console.log('Generated Google Drive video info:', info);
  return info;
}

/**
 * Converts a Google Drive sharing URL to a direct video URL
 * Example: https://drive.google.com/file/d/ABC123/view?usp=sharing
 * Becomes: https://drive.google.com/uc?id=ABC123
 */
export function convertGoogleDriveUrlToDirect(url: string): string {
  const info = getGoogleDriveVideoInfo(url);
  
  if (info) {
    // Use the streaming URL (uc?id=) which works better for video playback
    const directUrl = `https://drive.google.com/uc?id=${info.id}`;
    console.log('Converted Google Drive URL to direct:', directUrl);
    return directUrl;
  }
  
  // If not a Google Drive URL, return original
  console.log('Not a Google Drive URL, returning original:', url);
  return url;
}

/**
 * Generates helpful instructions for users having trouble with Google Drive videos
 */
export function getGoogleDriveInstructions(id: string): string {
  return `Para que este vídeo funcione corretamente:

1. Certifique-se de que o arquivo está compartilhado como "Qualquer pessoa com o link pode visualizar"
2. O link deve estar no formato: https://drive.google.com/file/d/${id}/view
3. Se ainda não funcionar, tente abrir o link diretamente no navegador para verificar se está acessível

Caso o problema persista, entre em contato com o administrador do sistema.`;
}

/**
 * Tests if a Google Drive URL is working by attempting to fetch it
 */
export async function testGoogleDriveUrl(url: string): Promise<{success: boolean, error?: string}> {
  try {
    const info = getGoogleDriveVideoInfo(url);
    if (!info) {
      return { success: false, error: 'Invalid Google Drive URL format' };
    }

    console.log('Testing Google Drive URL accessibility...');
    
    // Test the direct URL first
    const response = await fetch(info.directUrl, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    
    console.log('Google Drive URL test completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Google Drive URL test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}