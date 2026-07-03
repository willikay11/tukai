import { Area } from 'react-easy-crop';

export const getCroppedImageFile = async (
  imageSrc: string,
  cropArea: Area,
  fileName: string,
  fileType: string = 'image/jpeg',
): Promise<File> => {
  const response = await fetch(imageSrc);
  const blob = await response.blob();
  const image = await createImageBitmap(blob);

  // Cap output at 1024×1024
  const outputSize = Math.min(cropArea.width, cropArea.height, 1024);

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas to blob failed'));
          return;
        }
        resolve(new File([blob], fileName, { type: fileType }));
      },
      fileType,
      0.92,
    );
  });
};

export const imageNeedsCrop = (width: number, height: number): boolean => {
  // Needs crop if not square
  if (width !== height) return true;
  // Needs crop if larger than 1024px
  if (width > 1024 || height > 1024) return true;
  return false;
};

export const getImageDimensions = (
  file: File,
): Promise<{ width: number; height: number; objectUrl: string }> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        objectUrl,
      });
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
};
