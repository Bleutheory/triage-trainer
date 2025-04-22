import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext.tsx';
import AidBagSetup from '../AidBagSetup/AidBagSetup';

describe('AidBagSetup', () => {
  it('renders category items and updates total count when an item is added', () => {
    render(
      <AppProvider>
        <AidBagSetup isSetupPhase={true} />
      </AppProvider>
    );

    // Initially, total items should be zero
    const totalItemsBefore = screen.getByText(/Total Items:/);
    expect(totalItemsBefore).toHaveTextContent('Total Items: 0');

    // Click a known item
    const itemElement = screen.getAllByText(/Combat Application Tourniquet/i)[0];
    fireEvent.click(itemElement);

    // Now, total items should be 1
    const totalItemsAfter = screen.getByText(/Total Items:/);
    expect(totalItemsAfter).toHaveTextContent('Total Items: 1');
  });
});