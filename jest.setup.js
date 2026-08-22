import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// jsdom ships no TextEncoder/TextDecoder, but jose (via next-auth) reaches for
// them at import time. Node's implementations have the same API.
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;
