// Mock for @hugeicons-pro/core-bulk-rounded/loader. See
// core-twotone-rounded/loader.js for why this exists and what it returns.
module.exports = {
  loadIcon: async (name) => ({ name: String(name), variant: 'bulk' }),
};
