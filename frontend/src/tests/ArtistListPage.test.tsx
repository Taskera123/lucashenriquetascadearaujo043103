import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Subject } from 'rxjs';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ArtistListPage from '../pages/artistas/ArtistaListPage';
import { ArtistFacade } from '../facades/ArtistFacade';

vi.mock('../facades/ArtistFacade', async () => {
  const { BehaviorSubject } = await import('rxjs');
  return {
    artistList$: new BehaviorSubject({
      loading: false,
      error: null,
      query: '',
      sortDir: 'asc',
      page: 0,
      size: 10,
      total: 0,
      content: [],
    }),
    ArtistFacade: {
      search: vi.fn(),
      getAllAlbums: vi.fn().mockResolvedValue({ data: [] }),
      setQuery: vi.fn(),
      setSortDir: vi.fn(),
      setPage: vi.fn(),
    },
  };
});

vi.mock('../state/wsUpdates.store', () => ({
  updates$: new Subject(),
}));

vi.mock('../components/artistas/ArtistFormDialog', () => ({
  default: () => <div data-testid="artist-form-dialog" />,
}));

vi.mock('../components/artistas/ArtistDetailDialog', () => ({
  default: () => <div data-testid="artist-detail-dialog" />,
}));

vi.mock('primereact/datatable', () => ({
  DataTable: ({ children }: { children: ReactNode }) => <div data-testid="datatable">{children}</div>,
}));

vi.mock('primereact/column', () => ({
  Column: () => null,
}));

vi.mock('primereact/dropdown', () => ({
  Dropdown: () => <div data-testid="dropdown" />,
}));

vi.mock('primereact/carousel', () => ({
  Carousel: () => <div data-testid="carousel" />,
}));

describe('ArtistaListPage', () => {
  beforeEach(() => {
    vi.mocked(ArtistFacade.search).mockClear();
    vi.mocked(ArtistFacade.getAllAlbums).mockClear();
  });

  it('renderiza cabeçalho e botão de novo artista', async () => {
    render(
      <MemoryRouter>
        <ArtistListPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Artistas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /novo/i })).toBeInTheDocument();

    await waitFor(() => expect(ArtistFacade.search).toHaveBeenCalled());
  });
});
