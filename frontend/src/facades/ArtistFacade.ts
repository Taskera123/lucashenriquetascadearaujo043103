import { BehaviorSubject } from 'rxjs';
import { ArtistService } from '../services/ArtistaService';
import type { ArtistaDTO, SortDir } from '../types/api';

type State = {
  loading: boolean;
  error: string | null;
  query: string;
  sortDir: SortDir;
  page: number;
  size: number;
  total: number;
  content: ArtistaDTO[];
};

const initial: State = { loading: false, error: null, query: '', sortDir: 'asc', page: 0, size: 10, total: 0, content: [] };
export const artistList$ = new BehaviorSubject<State>(initial);

export const ArtistFacade = {
  setQuery(query: string) { artistList$.next({ ...artistList$.value, query, page: 0 }); },
  setSortDir(sortDir: SortDir) {
    artistList$.next({ ...artistList$.value, sortDir, page: 0 });
  },
  setPage(page: number, size: number) { artistList$.next({ ...artistList$.value, page, size }); },
  async getAllAlbums() {
    const { data } = await ArtistService.listarTodos({ pagina: 0, tamanho: 500, ordenacao: 'asc' });
    const albums = (data.content ?? []).flatMap((artist) => artist.albuns ?? []);
    return { data: albums };
  },
  async search() {
  const s = artistList$.value;
  const nome = s.query.trim();

  artistList$.next({ ...s, loading: true, error: null });

  try {
    if (!nome) {
      const { data } = await ArtistService.listarTodos({
        pagina: s.page,
        tamanho: s.size,
        ordenacao: s.sortDir
      });

      const content = normalizeArtists(data.content ?? []);

      artistList$.next({
        ...artistList$.value,
        loading: false,
        content,
        total: data.totalElements ?? 0
      });
      return;
    }

    if (nome.length < 2) {
      artistList$.next({ ...artistList$.value, loading: false, content: [], total: 0 });
      return;
    }

    const { data } = await ArtistService.pesquisar({ nome, pagina: s.page, tamanho: s.size });
    const content = sort(normalizeArtists(data.content ?? []), s.sortDir);

    artistList$.next({
      ...artistList$.value,
      loading: false,
      content,
      total: data.totalElements ?? 0
    });
  } catch (e: any) {
    artistList$.next({
      ...artistList$.value,
      loading: false,
      error: e?.message ?? 'Erro ao buscar artistas'
    });
  }
}
};

function sort(list: ArtistaDTO[], dir: SortDir) {
  return [...list].sort((a, b) => {
    const an = (a.nome ?? '').toLowerCase();
    const bn = (b.nome ?? '').toLowerCase();
    return dir === 'asc' ? an.localeCompare(bn) : bn.localeCompare(an);
  });
}

function normalizeArtists(list: ArtistaDTO[]) {
  return list.map((artist) => ({
    ...artist,
    id: artist.id ?? (artist as any).idArtista ?? null,
    nome: artist.nome ?? (artist as any).nomeArtista ?? ''
  }));
}
