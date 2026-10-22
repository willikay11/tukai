// Mock for @hugeicons-pro/core-duotone-rounded/loader. The bare package has
// no mock of its own (nothing exercised the real duotone import under test
// before IconComponent loaded it lazily), but the loader needs one so a test
// that renders a duotone icon without mocking Icons itself still resolves
// synchronously instead of hitting the real ESM package.
module.exports = {
  loadIcon: async (name) => ({ name: String(name), variant: 'duotone' }),
};
