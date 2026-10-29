import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import UsersPage from '../pages/admin/UsersPage';
import { useAuthStore } from '../store/authStore';
import { createUser, deactivateUser, getUsers } from '../services/userApi';

vi.mock('../services/userApi', () => ({
  getUsers: vi.fn(), createUser: vi.fn(), updateUser: vi.fn(), deactivateUser: vi.fn()
}));

const admin = { _id: 'admin-1', name: 'Admin', role: 'admin' };
const staff = { _id: 'staff-1', name: 'Asha Nurse', email: 'asha@example.org', role: 'nurse', isActive: true };

describe('Admin user management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: admin });
    getUsers.mockResolvedValue([staff]);
  });

  it('loads staff records and provides client side search', async () => {
    render(<UsersPage />);
    expect(await screen.findByText('Asha Nurse')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search name or email'), { target: { value: 'missing' } });
    expect(screen.getByText('No matching users')).toBeInTheDocument();
  });

  it('shows a retryable load error without substituting mock records', async () => {
    getUsers.mockRejectedValueOnce({ response: { data: { message: 'Service unavailable' } } });
    render(<UsersPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable');
    expect(screen.queryByText('Asha Nurse')).not.toBeInTheDocument();
  });

  it('creates a user and refreshes the list after the save succeeds', async () => {
    const created = { _id: 'staff-2', name: 'Maya Doctor', email: 'maya@example.org', role: 'doctor', isActive: true };
    getUsers.mockResolvedValueOnce([staff]).mockResolvedValueOnce([staff, created]);
    createUser.mockResolvedValue(created);
    render(<UsersPage />);
    await screen.findByText('Asha Nurse');
    fireEvent.click(screen.getByRole('button', { name: '+ Add User' }));
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Maya Doctor' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'maya@example.org' } });
    fireEvent.change(screen.getByLabelText(/Temporary password/), { target: { value: 'secure-pass-123' } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'doctor' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create user' }));
    await waitFor(() => expect(createUser).toHaveBeenCalledWith(expect.objectContaining({ name: 'Maya Doctor', role: 'doctor', password: 'secure-pass-123' })));
    expect(await screen.findByText('Maya Doctor')).toBeInTheDocument();
  });

  it('confirms deactivation before calling the API', async () => {
    deactivateUser.mockResolvedValue({});
    render(<UsersPage />);
    await screen.findByText('Asha Nurse');
    fireEvent.click(screen.getAllByRole('button', { name: 'Deactivate' })[0]);
    expect(deactivateUser).not.toHaveBeenCalled();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Deactivate' }));
    await waitFor(() => expect(deactivateUser).toHaveBeenCalledWith('staff-1'));
  });
});
