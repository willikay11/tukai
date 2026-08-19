// Mock for @hugeicons/react (ESM package jest can't parse).
// The icon prop is an object (see the core-*-rounded mocks), so it is pulled
// out rather than spread onto the DOM, and its name is exposed as a testid so
// tests can assert which icon IconComponent picked.
const React = require('react');

const HugeiconsIcon = ({ icon, className = '', ...props }) =>
  React.createElement('svg', {
    'data-testid': icon && icon.name ? icon.name : undefined,
    className,
    ...props,
  });

module.exports = { HugeiconsIcon };
