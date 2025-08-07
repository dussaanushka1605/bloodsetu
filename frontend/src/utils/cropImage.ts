// Utility to crop an image using react-easy-crop's output
// Returns a Blob

export default async function getCroppedImg(imageSrc: string, croppedAreaPixels: any): Promise<Blob> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Ensure croppedAreaPixels has all required properties
    if (!croppedAreaPixels || typeof croppedAreaPixels !== 'object' ||
        croppedAreaPixels.width === undefined || croppedAreaPixels.height === undefined ||
        croppedAreaPixels.x === undefined || croppedAreaPixels.y === undefined) {
      throw new Error('Invalid crop area');
    }

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      }, 'image/jpeg');
    });
  } catch (error) {
    console.error('Error in getCroppedImg:', error);
    throw error;
  }
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}