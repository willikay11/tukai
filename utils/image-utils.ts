export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

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

      // Minimum size check
      if (width < 500 || height < 500) {
        resolve({
          valid: false,
          error: `Image is too small (${width}×${height}px). Minimum size is 500×500px.`,
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
