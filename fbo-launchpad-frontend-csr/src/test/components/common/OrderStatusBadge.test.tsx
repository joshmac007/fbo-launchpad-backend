import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OrderStatusBadge from '../../../components/common/OrderStatusBadge';
import { FuelOrderStatus } from '../../../types/fuelOrder';

describe('OrderStatusBadge', () => {
  const testCases = [
    { status: FuelOrderStatus.PENDING, expectedText: 'PENDING', bgColor: 'bg-yellow-200', textColor: 'text-yellow-800' },
    { status: FuelOrderStatus.ACKNOWLEDGED, expectedText: 'ACKNOWLEDGED', bgColor: 'bg-blue-200', textColor: 'text-blue-800' },
    { status: FuelOrderStatus.DISPATCHED, expectedText: 'DISPATCHED', bgColor: 'bg-indigo-200', textColor: 'text-indigo-800' },
    { status: FuelOrderStatus.EN_ROUTE, expectedText: 'EN ROUTE', bgColor: 'bg-purple-200', textColor: 'text-purple-800' }, // Text replaces _
    { status: FuelOrderStatus.FUELING, expectedText: 'FUELING', bgColor: 'bg-pink-200', textColor: 'text-pink-800' },
    { status: FuelOrderStatus.COMPLETED, expectedText: 'COMPLETED', bgColor: 'bg-green-200', textColor: 'text-green-800' },
    { status: FuelOrderStatus.REVIEWED, expectedText: 'REVIEWED', bgColor: 'bg-teal-200', textColor: 'text-teal-800' },
    { status: FuelOrderStatus.CANCELLED, expectedText: 'CANCELLED', bgColor: 'bg-red-200', textColor: 'text-red-800' },
    { status: FuelOrderStatus.ON_HOLD, expectedText: 'ON HOLD', bgColor: 'bg-gray-400', textColor: 'text-gray-900' }, // Text replaces _
    { status: 'SOME_UNKNOWN_STATUS', expectedText: 'SOME UNKNOWN STATUS', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
  ];

  testCases.forEach(({ status, expectedText, bgColor, textColor }) => {
    it(`should render ${status} status with correct text and classes`, () => {
      render(<OrderStatusBadge status={status as FuelOrderStatus} />); // Cast for unknown status test
      const badge = screen.getByText(expectedText.toUpperCase()); // Component converts to uppercase and replaces _
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('px-3', 'py-1', 'inline-flex', 'text-xs', 'leading-5', 'font-semibold', 'rounded-full');
      expect(badge).toHaveClass(bgColor);
      expect(badge).toHaveClass(textColor);
    });
  });

  it('should replace underscores with spaces in status text', () => {
    render(<OrderStatusBadge status={FuelOrderStatus.EN_ROUTE} />);
    expect(screen.getByText('EN ROUTE')).toBeInTheDocument(); // Text display handles underscore

    render(<OrderStatusBadge status={FuelOrderStatus.ON_HOLD} />);
    expect(screen.getByText('ON HOLD')).toBeInTheDocument();
  });

  it('should handle a string status not in enum correctly (default case)', () => {
    const customStatus = 'CUSTOM_WAITING';
    render(<OrderStatusBadge status={customStatus} />);
    const badge = screen.getByText('CUSTOM WAITING');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-600');
  });
}); 