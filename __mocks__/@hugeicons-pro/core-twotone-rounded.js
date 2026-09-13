// Mock for @hugeicons-pro/core-twotone-rounded (ESM package jest can't parse).
// IconComponent does `import * as Icons` then checks `iconName in Icons` and
// reads `Icons[iconName]`, so every name must be present and return a value.
// __esModule: true makes the wildcard-import interop return this Proxy as-is
// instead of copying (zero) own keys into a namespace object.
module.exports = new Proxy(
  {},
  {
    has: () => true,
    get: (_, name) => {
      if (name === '__esModule') return true;
      return { name: String(name) };
    },
  },
);
