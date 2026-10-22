// Mock for @hugeicons-pro/core-solid-rounded/loader. See
// core-twotone-rounded/loader.js for why this exists and what it returns.
module.exports = {
  loadIcon: async (name) => ({ name: String(name), variant: 'solid' }),
};
