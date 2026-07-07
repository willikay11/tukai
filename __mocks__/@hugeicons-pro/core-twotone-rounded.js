// Mock for @hugeicons-pro/core-twotone-rounded (ESM package jest can't parse).
// IconComponent does `import * as Icons` then checks `iconName in Icons` and
// reads `Icons[iconName]`, so every name must be present and return a value.
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
