// Mock for @hugeicons/react (ESM package jest can't parse).
const React = require('react');

const HugeiconsIcon = ({ className = '', ...props }) =>
  React.createElement('svg', { className, ...props });

module.exports = { HugeiconsIcon };
