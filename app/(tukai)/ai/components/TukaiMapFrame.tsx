'use client';

import { useEffect, useRef } from 'react';

import type { TukaiPin } from '@/utils/tukai';

const MAP_SRC = '/tukai/map.html';

/**
 * The map of what TukAI suggested: public/tukai/map.html in an iframe,
 * driven by postMessage. Pins go across whenever the set changes; a new
 * selection alone sends only `tk-sel`, so the map does not refit.
 */
export const TukaiMapFrame = ({
  pins,
  route,
  selectedId,
  onPin,
  onOpen,
}: {
  pins: TukaiPin[];
  /** A plan: dashed lines join each day's stops. */
  route: boolean;
  selectedId: string | null;
  onPin: (id: string) => void;
  onOpen: (id: string) => void;
}) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const sentRef = useRef<{ signature: string; selected: string | null } | null>(null);
  const handlers = useRef({ onPin, onOpen });
  handlers.current = { onPin, onOpen };

  const signature = JSON.stringify([pins.map((p) => `${p.id}|${p.when}`), route]);

  const sync = () => {
    const target = frameRef.current?.contentWindow;
    if (!target || !readyRef.current) return;
    const origin = window.location.origin;
    if (sentRef.current?.signature !== signature) {
      sentRef.current = { signature, selected: selectedId };
      target.postMessage({ type: 'tk-pins', pins, route, sel: selectedId, padL: 48 }, origin);
    } else if (sentRef.current.selected !== selectedId) {
      sentRef.current.selected = selectedId;
      target.postMessage({ type: 'tk-sel', id: selectedId }, origin);
    }
  };
  // The listener below is added once; this keeps it calling the latest pins
  const syncRef = useRef(sync);
  syncRef.current = sync;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'tk-map-ready') {
        readyRef.current = true;
        sentRef.current = null;
        syncRef.current();
      } else if (data.type === 'tk-pin' && typeof data.id === 'string') {
        handlers.current.onPin(data.id);
      } else if (data.type === 'tk-open' && typeof data.id === 'string') {
        handlers.current.onOpen(data.id);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => syncRef.current(), [signature, selectedId]);

  return (
    <iframe
      ref={frameRef}
      src={MAP_SRC}
      title="Map of TukAI suggestions"
      className="absolute inset-0 block h-full w-full border-0"
    />
  );
};
