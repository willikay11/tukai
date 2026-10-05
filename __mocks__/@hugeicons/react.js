// Mock for @hugeicons/react (ESM package jest can't parse).
// The icon prop is an object (see the core-*-rounded mocks), so it is pulled
// out rather than spread onto the DOM. Its name is exposed as a testid and its
// style as data-variant, so tests can assert both which icon IconComponent
// picked and which of the three packages it took it from.
const React = require('react');

const HugeiconsIcon = ({ icon, className = '', ...props }) =>
  React.createElement('svg', {
    'data-testid': icon && icon.name ? icon.name : undefined,
    'data-variant': icon && icon.variant ? icon.variant : undefined,
    className,
    ...props,
  });

module.exports = { HugeiconsIcon };
