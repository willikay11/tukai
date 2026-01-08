import localFont from 'next/font/local';

export const satoshi = localFont({
  src: [
    { path: '../Satoshi-Light.woff', weight: '300' },
    { path: '../Satoshi-Regular.woff', weight: '400' },
    { path: '../Satoshi-Medium.woff', weight: '500' },
    { path: '../Satoshi-Bold.woff', weight: '800' },
    { path: '../Satoshi-Black.woff', weight: '900' },
  ],
});
