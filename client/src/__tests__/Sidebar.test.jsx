/* global describe, it, expect, beforeEach */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppErrorBoundary from '../components/common/AppErrorBoundary';
import Sidebar from '../components/layout/Sidebar';
import { useAuthStore } from '../store/authStore';

const ThrowingComponent = () => {
  throw new Error('Boom');
};

describe('Sidebar', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { name: 'Dr. Smith', role: 'doctor' },
      token: 'test-token',
    });
  });

  it('renders doctor navigation and marks the current route active', () => {
    render(
      <MemoryRouter initialEntries={['/doctor/patients']}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('ICU Monitor')).toBeInTheDocument();
    const patientLink = screen.getByRole('link', { name: /Patients/i });
    expect(patientLink).toHaveAttribute('href', '/doctor/patients');
    expect(patientLink).toHaveClass('bg-blue-600');
  });

  it('shows a safe fallback when a child component crashes', () => {
    render(
      <AppErrorBoundary>
        <ThrowingComponent />
      </AppErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
