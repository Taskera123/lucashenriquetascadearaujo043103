import { BehaviorSubject } from 'rxjs';
import { CatalogoService } from '../services/CatalogoService';
import type { AlbumDTO, ArtistaResponseDTO, BandaResponseDTO } from '../types/api';

type State = {
  loading: boolean;
  error: string | null;
  albums: AlbumDTO[];
  artists: ArtistaResponseDTO[];
  bands: BandaResponseDTO[];
  lastFetchedAt: number | null;
};

const initial: State = {
  loading: false,
  error: null,
  albums: [],
  artists: [],
  bands: [],
  lastFetchedAt: null
};

const CACHE_WINDOW_MS = 60_000;

export const albumCatalog$ = new BehaviorSubject<State>(initial);

export const AlbumFacade = {
  async loadCatalog(options?: { force?: boolean }) {
    const force = options?.force ?? false;
    const current = albumCatalog$.value;
    const hasCache = current.lastFetchedAt != null;
    const cacheFresh = hasCache && current.lastFetchedAt !== null && Date.now() - current.lastFetchedAt < CACHE_WINDOW_MS;

    if (!force && cacheFresh) {
      return current;
    }

    albumCatalog$.next({ ...current, loading: true, error: null });

    try {
      const { data } = await CatalogoService.obterCatalogo();
      const next = {
        ...albumCatalog$.value,
        loading: false,
        albums: data.albuns ?? [],
        artists: data.artistas ?? [],
        bands: data.bandas ?? [],
        lastFetchedAt: Date.now()
      };
      albumCatalog$.next(next);
      return next;
    } catch (e: any) {
      const next = {
        ...albumCatalog$.value,
        loading: false,
        error: e?.message ?? 'Erro ao carregar catálogo'
      };
      albumCatalog$.next(next);
      return next;
    }
  }
};
