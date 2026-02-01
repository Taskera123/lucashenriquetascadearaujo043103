import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import { AuthFacade } from '../facades/AuthFacade';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../facades/AuthFacade', () => ({
  AuthFacade: {
    login: vi.fn(),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.mocked(AuthFacade.login).mockReset();
  });

  it('mostra erro quando campos estão vazios', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByText('Informe usuário e senha.')).toBeInTheDocument();
  });

  it('realiza login e navega para admin', async () => {
    vi.mocked(AuthFacade.login).mockResolvedValue('Bearer token');

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'usuario' } });
    fireEvent.change(inputs[1], { target: { value: 'senha' } });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(AuthFacade.login).toHaveBeenCalledWith({ username: 'usuario', password: 'senha' }));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/artistas');
  });
});
