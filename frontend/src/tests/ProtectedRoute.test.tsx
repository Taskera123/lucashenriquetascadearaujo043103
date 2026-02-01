import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { clearAuth, setAuth } from '../state/auth.store';
import { expect } from 'vitest';

describe('ProtectedRoute', () => {
  afterEach(() => {
    clearAuth();
  });

  it('redireciona para login quando não autenticado', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/admin"
            element={(
              <ProtectedRoute>
                <div>Área restrita</div>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('exibe conteúdo protegido quando autenticado', () => {
    setAuth({ tokenWithType: 'Bearer token', expiresAt: Date.now() + 1000, username: 'user' });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/admin"
            element={(
              <ProtectedRoute>
                <div>Área restrita</div>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Área restrita')).toBeInTheDocument();
  });
});
