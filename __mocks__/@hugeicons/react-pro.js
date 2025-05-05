// __mocks__/hugeiconsMock.js
const React = require('react');
module.exports = new Proxy(
  {},
  {
    get:
      (_, iconName) =>
      ({ className = '', ...props }) =>
        React.createElement('svg', {
          'data-testid': iconName,
          className,
          ...props,
        }),
  },
);
