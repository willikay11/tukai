import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// jsdom ships no TextEncoder/TextDecoder, but jose (via next-auth) reaches for
// them at import time. Node's implementations have the same API.
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;

// Radix's Select and Dropdown drive their triggers through Pointer Events and
// scroll the active item into view. jsdom implements neither, so a trigger
// click never opens the list and no option is ever rendered.
if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false;
  if (!Element.prototype.setPointerCapture) Element.prototype.setPointerCapture = () => {};
  if (!Element.prototype.releasePointerCapture) Element.prototype.releasePointerCapture = () => {};
  if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
}
