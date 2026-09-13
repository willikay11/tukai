export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

// Small images are accepted — they just lose detail once cropped, so this is a
// quality hint rather than a hard floor
export const RECOMMENDED_MIN_DIMENSION = 500;

export const validateExperienceImage = (file: File): Promise<ImageValidationResult> => {
  return new Promise((resolve) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      resolve({
        valid: false,
        error: 'Please upload a JPEG, PNG, or WebP image.',
      });
      return;
    }

    // Check file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      resolve({
        valid: false,
        error: `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`,
      });
      return;
    }

    // Check dimensions
    const url = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;

      // Below the recommended size the upload still goes through, the user is
      // just told it may not look sharp
      if (width < RECOMMENDED_MIN_DIMENSION || height < RECOMMENDED_MIN_DIMENSION) {
        resolve({
          valid: true,
          warning: `This image is small (${width}×${height}px) and may look blurry. ${RECOMMENDED_MIN_DIMENSION}×${RECOMMENDED_MIN_DIMENSION}px or larger is recommended.`,
        });
        return;
      }

      // Valid — crop dialog handles:
      //   - non-square aspect ratio
      //   - images larger than 1024×1024
      // No warning needed — crop is automatic
      resolve({ valid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: 'Could not read the image file. Please try another.',
      });
    };

    img.src = url;
  });
};
