// Mock for @hugeicons-pro/core-twotone-rounded/loader (ESM package jest can't
// parse). IconComponent awaits `loadIcon(name)` instead of reading a wildcard
// import, so this resolves the same {name, variant} shape the sibling
// core-twotone-rounded.js mock returns synchronously - any name is "found".
module.exports = {
  loadIcon: async (name) => ({ name: String(name), variant: 'twotone' }),
};
