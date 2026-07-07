// Mock for @hugeicons-pro/core-solid-rounded (ESM package jest can't parse).
// See core-twotone-rounded.js for why the Proxy is shaped this way.
module.exports = new Proxy(
  {},
  {
    has: () => true,
    get: (_, name) => {
      if (name === '__esModule') return false;
      return { name: String(name) };
    },
  },
);
