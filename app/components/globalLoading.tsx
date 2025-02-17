'use client';
import NextTopLoader from 'nextjs-toploader';

export default function GlobalLoading() {
  return (
    <NextTopLoader
      color="#047857"
      initialPosition={0.08}
      crawlSpeed={200}
      height={5}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #047857,0 0 5px #04785766"
    />
  );
}
