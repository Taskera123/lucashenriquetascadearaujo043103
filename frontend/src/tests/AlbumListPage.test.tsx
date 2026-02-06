import { render, screen, waitFor } from '@testing-library/react';
import { Subject } from 'rxjs';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AlbumListPage from '../pages/albums/AlbumListPage';

const { loadCatalog } = vi.hoisted(() => ({
  loadCatalog: vi.fn().mockResolvedValue({
    loading: false,
    error: null,
    albums: [],
    artists: [],
    bands: [],
    lastFetchedAt: Date.now(),
  }),
}));

vi.mock('../facades/AlbumFacade', () => ({
  AlbumFacade: {
    loadCatalog,
  },
}));

vi.mock('../state/wsUpdates.store', () => ({
  updates$: new Subject(),
}));

vi.mock('../components/albums/AlbumFormDialog', () => ({
  default: () => <div data-testid="album-form-dialog" />,
}));

vi.mock('primereact/dataview', () => ({
  DataView: ({ emptyMessage }: { emptyMessage?: string }) => <div data-testid="dataview">{emptyMessage}</div>,
}));

vi.mock('primereact/dropdown', () => ({
  Dropdown: () => <div data-testid="dropdown" />,
}));

describe('AlbumListPage', () => {
  beforeEach(() => {
    loadCatalog.mockClear();
  });

  it('renderiza título e botão de novo álbum', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/albums']}>
        <Routes>
          <Route path="/admin/albums" element={<AlbumListPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Álbuns')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /novo álbum/i })).toBeInTheDocument();

    await waitFor(() => expect(loadCatalog).toHaveBeenCalled());
  });
});
