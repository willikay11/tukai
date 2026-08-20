import { render } from '@testing-library/react';

import { PAGE_CONTENT_COLUMNS, PageContainer } from './PageContainer';

describe('PageContainer', () => {
  it('renders a 12-column grid with a single main landmark', () => {
    const { container } = render(<PageContainer>content</PageContainer>);
    const main = container.querySelector('main');

    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('grid', 'grid-cols-12');
  });

  // These offsets are what line the page up with Experiences, Places and
  // Communities; drifting from them is the bug this component exists to prevent
  it('applies the shared content column offsets', () => {
    const { container } = render(<PageContainer>content</PageContainer>);
    const column = container.querySelector('main > div');

    PAGE_CONTENT_COLUMNS.split(' ').forEach((className) =>
      expect(column).toHaveClass(className),
    );
  });

  it('adds per-page spacing without dropping the offsets', () => {
    const { container } = render(<PageContainer className="space-y-10 py-6">content</PageContainer>);
    const column = container.querySelector('main > div');

    expect(column).toHaveClass('space-y-10', 'py-6', 'md:col-span-10', 'md:col-start-2');
  });

  it('renders its children', () => {
    const { getByText } = render(
      <PageContainer>
        <p>hello</p>
      </PageContainer>,
    );

    expect(getByText('hello')).toBeInTheDocument();
  });
});
