import { render, screen } from '@testing-library/react';

import { IncludedExcludedSection } from './index';

// The editor produces <ul><li><p>…</p></li></ul>
const LIST = '<ul><li><p>Park entry fees</p></li><li><p>Bottled water</p></li></ul>';

describe('IncludedExcludedSection', () => {
  it('renders both headings', () => {
    render(<IncludedExcludedSection included={LIST} excluded={LIST} />);

    expect(screen.getByText("What's included")).toBeInTheDocument();
    expect(screen.getByText("What's not included")).toBeInTheDocument();
  });

  it('renders list content as a real list', () => {
    const { container } = render(<IncludedExcludedSection included={LIST} />);

    expect(container.querySelectorAll('ul')).toHaveLength(1);
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(screen.getByText('Park entry fees')).toBeInTheDocument();
  });

  // Regression: each item's text sits in a block <p>, which pushed it onto the
  // line below its bullet. The rich-text rules make those paragraphs inline and
  // keep the list flush with the heading.
  it('opts the rendered content into the rich-text rules', () => {
    const { container } = render(<IncludedExcludedSection included={LIST} />);

    const body = container.querySelector('.rich-text');
    expect(body).toBeInTheDocument();
    expect(body?.querySelector('li > p')).toBeInTheDocument();
  });

  it('keeps the bullet styling the sanitiser applies', () => {
    const { container } = render(<IncludedExcludedSection included={LIST} />);

    expect(container.querySelector('ul')).toHaveClass('list-disc', 'list-inside');
  });

  it('renders nothing in a column with no content', () => {
    const { container } = render(<IncludedExcludedSection included={LIST} />);

    const bodies = container.querySelectorAll('.rich-text');
    expect(bodies).toHaveLength(2);
    expect(bodies[1].innerHTML).toBe('');
  });
});
