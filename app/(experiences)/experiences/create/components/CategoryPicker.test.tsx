import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryPicker } from './CategoryPicker';

describe('CategoryPicker', () => {
  it('renders all category options', () => {
    render(<CategoryPicker selectedCategories={[]} onChange={() => {}} />);
    expect(screen.getByText('Hiking')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Safari')).toBeInTheDocument();
  });

  it('highlights selected categories', () => {
    render(<CategoryPicker selectedCategories={['Hiking', 'Running']} onChange={() => {}} />);
    const hikingButton = screen.getByRole('button', { name: 'Hiking' });
    const runningButton = screen.getByRole('button', { name: 'Running' });
    expect(hikingButton).toHaveClass('bg-emerald-600');
    expect(runningButton).toHaveClass('bg-emerald-600');
  });

  it('toggles category on click', () => {
    const onChange = jest.fn();
    render(<CategoryPicker selectedCategories={['Hiking']} onChange={onChange} />);
    const hikingButton = screen.getByRole('button', { name: 'Hiking' });
    fireEvent.click(hikingButton);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('adds category when clicking unselected category', () => {
    const onChange = jest.fn();
    render(<CategoryPicker selectedCategories={['Hiking']} onChange={onChange} />);
    const runningButton = screen.getByRole('button', { name: 'Running' });
    fireEvent.click(runningButton);
    expect(onChange).toHaveBeenCalledWith(['Hiking', 'Running']);
  });
});
