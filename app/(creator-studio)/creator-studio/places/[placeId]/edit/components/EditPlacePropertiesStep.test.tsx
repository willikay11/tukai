import React, { useState } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PropertyValue } from '../schemas';
import { EditPlacePropertiesStep } from './EditPlacePropertiesStep';

const onChange = jest.fn();

const renderStep = (properties: PropertyValue[] = [], categoryNames = ['Nairobi', 'Restaurants']) =>
  render(
    <EditPlacePropertiesStep
      categoryNames={categoryNames}
      properties={properties}
      errors={{}}
      onChange={onChange}
    />,
  );

// The page holds the properties and hands them straight back down. A field
// that reports its value on every render rather than on every change loops
// forever against that, which is what took the whole step down.
const StatefulHarness = ({ initial }: { initial: PropertyValue[] }) => {
  const [properties, setProperties] = useState(initial);

  return (
    <EditPlacePropertiesStep
      categoryNames={['Nairobi', 'Restaurants']}
      properties={properties}
      errors={{}}
      onChange={setProperties}
    />
  );
};

describe('EditPlacePropertiesStep', () => {
  beforeEach(() => jest.clearAllMocks());

  it('settles when its parent feeds the properties back to it', () => {
    render(
      <StatefulHarness initial={[{ id: 'p1', key: 'Phone Number', value: '+254721920820' }]} />,
    );

    expect(screen.getByText('Dining Style')).toBeInTheDocument();
  });

  it('names the categories the pills come from', () => {
    renderStep();

    expect(
      screen.getByText(/comes from this place's categories: Nairobi, Restaurants/),
    ).toBeInTheDocument();
  });

  it("offers the groups the place's categories call for", () => {
    renderStep();

    expect(screen.getByText('Dining Style')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fine dining' })).toBeInTheDocument();
    // Landmarks is not one of this place's categories
    expect(screen.queryByText('Type of Landmark')).not.toBeInTheDocument();
  });

  it('shows what is already saved as selected', () => {
    renderStep([{ id: 'p1', key: 'Meal Type', value: 'Breakfast, Dinner' }]);

    expect(screen.getByRole('button', { name: 'Breakfast' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Lunch' })).toHaveAttribute('aria-pressed', 'false');
  });

  // Places hold values no list offers; dropping them would delete them on save
  it('keeps a saved value the catalogue does not offer', () => {
    renderStep([{ id: 'p1', key: 'Meal Type', value: 'High tea' }]);

    expect(screen.getByRole('button', { name: 'High tea' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('writes a picked pill into the property as a joined value', async () => {
    const user = userEvent.setup();
    renderStep([{ id: 'p1', key: 'Meal Type', value: 'Breakfast' }]);

    await user.click(screen.getByRole('button', { name: 'Dinner' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'p1', key: 'Meal Type', value: 'Breakfast, Dinner' }),
    ]);
  });

  it('adds the property the first time a pill is picked', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(screen.getByRole('button', { name: 'Buffet' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ key: 'Dining Style', value: 'Buffet' }),
    ]);
  });

  // An empty property is not a property
  it('drops the property when its last pill is unpicked', async () => {
    const user = userEvent.setup();
    renderStep([{ id: 'p1', key: 'Meal Type', value: 'Dinner' }]);

    await user.click(screen.getByRole('button', { name: 'Dinner' }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  // Days alone are not hours, but the selection still has to hold while the
  // times are picked
  it('keeps a part-made hours selection without storing it', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(screen.getByRole('button', { name: 'Monday' }));

    expect(screen.getByRole('button', { name: 'Monday' })).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('stores the hours once days and both times are set', async () => {
    const user = userEvent.setup();
    renderStep([{ id: 'p1', key: 'Open Hours', value: 'Monday - Friday: 11:00 AM - 11:00 PM' }]);

    await user.click(screen.getByRole('button', { name: 'Saturday' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        key: 'Open Hours',
        value: 'Monday - Saturday: 11:00 AM - 11:00 PM',
      }),
    ]);
  });

  it('shows the saved hours in the pickers', () => {
    renderStep([{ id: 'p1', key: 'Open Hours', value: 'Monday - Friday: 11:00 AM - 11:00 PM' }]);

    expect(screen.getByRole('button', { name: 'Monday' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Sunday' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText(/Monday - Friday: 11:00 AM - 11:00 PM/)).toBeInTheDocument();
  });

  // Rather than half-parsing it into the pickers and rewriting it on save
  it('leaves hours it cannot read alone, and says so', () => {
    renderStep([
      {
        id: 'p1',
        key: 'Open Hours',
        value: 'Monday - Saturday: 6:00 Am - 10:00 Pm | Sunday: 9:00 Am - 10:00 Pm',
      },
    ]);

    expect(screen.getByText(/Currently saved:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Monday' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('seeds the email from what is stored', () => {
    renderStep([{ id: 'p1', key: 'Email', value: 'hello@kraftory.co.ke' }]);

    expect(screen.getByLabelText('Email')).toHaveValue('hello@kraftory.co.ke');
  });

  // Anything the groups above do not cover has to stay reachable
  it('lists a property no group offers under Other details', () => {
    renderStep([{ id: 'p1', key: 'Parking', value: 'Free on site' }]);

    expect(screen.getByLabelText('Detail 1 name')).toHaveValue('Parking');
    expect(screen.getByLabelText('Detail 1 value')).toHaveValue('Free on site');
  });

  it("does not repeat a group's property under Other details", () => {
    renderStep([{ id: 'p1', key: 'Meal Type', value: 'Dinner' }]);

    expect(screen.queryByLabelText('Detail 1 name')).not.toBeInTheDocument();
  });
});
