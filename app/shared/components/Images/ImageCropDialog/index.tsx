'use client';

import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';

import { Button } from '@/components/ui/button';
import { getCroppedImageFile } from '@/utils/image-crop-utils';

interface ImageCropDialogProps {
  imageSrc: string;
  fileName: string;
  fileType: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

export const ImageCropDialog = ({
  imageSrc,
  fileName,
  fileType,
  onCropComplete,
  onCancel,
}: ImageCropDialogProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((crop: { x: number; y: number }) => setCrop(crop), []);

  const onZoomChange = useCallback((zoom: number) => setZoom(zoom), []);

  const onCropCompleteHandler = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        fileName,
        fileType,
      );
      onCropComplete(croppedFile);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between bg-black px-4 py-3">
        <button onClick={onCancel} className="text-sm font-medium text-white" type="button">
          Cancel
        </button>
        <p className="text-sm font-semibold text-white">Crop Photo</p>
        <Button
          onClick={handleSave}
          disabled={isProcessing}
          size="sm"
          className="rounded-full bg-primary px-4 text-white"
        >
          {isProcessing ? 'Saving...' : 'Done'}
        </Button>
      </div>

      {/* Crop area — takes remaining height */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={16 / 9}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteHandler}
          showGrid
          style={{
            containerStyle: { background: '#000' },
          }}
        />
      </div>

      {/* Zoom slider */}
      {/* <div className="flex items-center gap-3 bg-black px-6 py-4">
        <span className="text-xs text-white">−</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-primary"
        />
        <span className="text-xs text-white">+</span>
      </div> */}

      {/* Hint */}
      <p className="pb-4 text-center text-xs text-white/60">
        Pinch or use slider to zoom · Drag to reposition
      </p>
    </div>
  );
};
