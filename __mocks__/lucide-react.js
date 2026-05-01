module.exports = {
  __esModule: true,
  default: () => <div />,
};

// Create a Proxy to handle any icon import dynamically
const handler = {
  get(target, prop) {
    if (prop === '__esModule') return true;
    if (prop === 'default') return () => null;
    // Return a mock component for any icon name
    return () => null;
  },
};

module.exports = new Proxy(module.exports, handler);
