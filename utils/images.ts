const hasImageSignature = (headerBytes: Uint8Array) => {
  const startsWith = (signature: number[]) =>
    signature.every((byte, index) => headerBytes[index] === byte);

  const isJpeg = startsWith([0xff, 0xd8, 0xff]);
  const isPng = startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const isGif = startsWith([0x47, 0x49, 0x46, 0x38]);
  const isWebp =
    startsWith([0x52, 0x49, 0x46, 0x46]) &&
    headerBytes[8] === 0x57 &&
    headerBytes[9] === 0x45 &&
    headerBytes[10] === 0x42 &&
    headerBytes[11] === 0x50;
  const isBmp = startsWith([0x42, 0x4d]);
  const isTiff =
    startsWith([0x49, 0x49, 0x2a, 0x00]) || startsWith([0x4d, 0x4d, 0x00, 0x2a]);

  return isJpeg || isPng || isGif || isWebp || isBmp || isTiff;
};

const isSvgContent = async (file: File) => {
  const textSample = await file.slice(0, 1024).text();
  return /<svg[\s>]/i.test(textSample);
};

async function validateImageFile(file: File) {
  if (!(file instanceof File)) {
    return false;
  }

  if (file.size <= 0) {
    return false;
  }

  if (file.type && !file.type.startsWith('image/')) {
    return false;
  }

  if (file.type === 'image/svg+xml') {
    return isSvgContent(file);
  }

  const headerBuffer = await file.slice(0, 12).arrayBuffer();
  const headerBytes = new Uint8Array(headerBuffer);
  return hasImageSignature(headerBytes);
}

async function assertValidImageFiles(photos: File[]) {
  const validationResults = await Promise.all(
    photos.map(async (photo) => ({
      fileName: photo?.name || 'unknown-file',
      isValid: await validateImageFile(photo),
    })),
  );

  const invalidFiles = validationResults.filter((result) => !result.isValid);

  if (invalidFiles.length > 0) {
    throw new Error(
      `Invalid image file(s): ${invalidFiles.map((file) => file.fileName).join(', ')}`,
    );
  }
}

export { assertValidImageFiles };