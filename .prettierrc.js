module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  importOrder: ['^react', '^next', '<THIRD_PARTY_MODULES>', '^@/', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
