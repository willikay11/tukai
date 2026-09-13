import { ImageResponse } from 'next/og';

/**
 * The card every shared Tukai link previews with.
 *
 * Raw uploads cannot be used directly: photos come off the CDN at whatever size
 * they were uploaded — one that prompted this was 2.4MB and 1920×2560 portrait,
 * which WhatsApp drops outright. No resized variant exists either, since
 * `photo_webp_*_url` come back null. So the card is composed at the 1200×630
 * every platform expects, and `next/og` rasterises the photo down to fit.
 *
 * Kept edge-safe on purpose — these routes run on the edge runtime, so nothing
 * here may reach for axios, next-auth or node built-ins.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

/** Fetches just enough of a record to title its card. Never throws. */
export const fetchOgSubject = async (path: string): Promise<{ title?: string; photo?: string }> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      headers: { 'User-Agent': 'Tukai' },
      // A preview does not need to be to the second, and a crawler should not
      // wait on the API for one
      next: { revalidate: 3600 },
    });

    if (!response.ok) return {};

    const record = await response.json();
    const photos: { photo?: string; is_cover?: boolean }[] = record?.photos ?? [];

    return {
      title: record?.title ?? record?.name,
      photo: photos.find((entry) => entry.is_cover)?.photo ?? photos[0]?.photo,
    };
  } catch {
    // A card that says Tukai is better than no preview at all
    return {};
  }
};

export const renderOgCard = ({ title, photo }: { title: string; photo?: string }) =>
  new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#064E3B',
      }}
    >
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Enough of a wash for white type to read over any photo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 60%)',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 64,
          width: '100%',
          height: '100%',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, color: '#A3E635', fontWeight: 600 }}>
          Tukai
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            color: 'white',
            fontWeight: 700,
            lineHeight: 1.1,
            marginTop: 12,
          }}
        >
          {title}
        </div>
      </div>
    </div>,
    OG_SIZE,
  );
