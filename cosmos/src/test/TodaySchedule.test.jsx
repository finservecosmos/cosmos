import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TodaySchedule from '../widgets/TodaySchedule';

describe('TodaySchedule Component', () => {
  it('renders loading text when loading prop is true', () => {
    render(<TodaySchedule schedule={[]} loading={true} onAdd={() => {}} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders empty message when schedule is empty', () => {
    render(<TodaySchedule schedule={[]} loading={false} onAdd={() => {}} />);
    expect(screen.getByText('No events scheduled for today.')).toBeInTheDocument();
  });

  it('renders list of events correctly', () => {
    const mockSchedule = [
      { id: '1', time: '10:00 AM', title: 'Client Meet', description: 'Discuss Home Loan', highlight: true },
      { id: '2', time: '02:00 PM', title: 'Associate Onboarding', description: 'Review details', highlight: false }
    ];

    render(<TodaySchedule schedule={mockSchedule} loading={false} onAdd={() => {}} />);

    expect(screen.getByText('Client Meet')).toBeInTheDocument();
    expect(screen.getByText('Discuss Home Loan')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();

    expect(screen.getByText('Associate Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Review details')).toBeInTheDocument();
    expect(screen.getByText('02:00 PM')).toBeInTheDocument();
  });

  it('calls onAdd when clicking the add schedule button', () => {
    const handleAdd = vi.fn();
    render(<TodaySchedule schedule={[]} loading={false} onAdd={handleAdd} />);

    const button = screen.getByRole('button', { name: /add event/i });
    fireEvent.click(button);

    expect(handleAdd).toHaveBeenCalledTimes(1);
  });
});
