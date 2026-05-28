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

  const canvas = document.createElement('canvas');
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height,
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

export const imageNeedsCrop = (
  width: number,
  height: number,
): boolean => {
  const ratio = width / height;
  return ratio < 1.2;
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
