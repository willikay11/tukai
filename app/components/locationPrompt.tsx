'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';

export default function LocationPrompt() {
  const { lat, lng, status, requestLocation } = useLocation();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const dismissedFlag = sessionStorage.getItem('location_prompt_dismissed');
    setDismissed(Boolean(dismissedFlag));
  }, []);

  useEffect(() => {
    if (!dismissed && status === 'idle' && lat === undefined && lng === undefined) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [status, dismissed, lat, lng]);

  const handleDismiss = () => {
    sessionStorage.setItem('location_prompt_dismissed', '1');
    setDismissed(true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogContent className="max-w-md">
        <div className="p-4">
          <p className="mb-2 text-lg font-semibold">Allow location access</p>
          <p className="mb-4 text-sm text-gray-600">
            To personalise experiences near you, Tukai needs access to your location. Please allow
            location access when prompted.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                requestLocation();
                setOpen(false);
              }}
            >
              Allow Location
            </Button>
            <Button variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
