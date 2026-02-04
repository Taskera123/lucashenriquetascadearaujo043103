import { BehaviorSubject } from 'rxjs';
import { BandaService } from '../services/BandaService';
import { AlbumFacade } from './AlbumFacade';
import type { BandaResponseDTO, SortDir } from '../types/api';

type State = {
  loading: boolean;
  error: string | null;
  sortDir: SortDir;
  page: number;
  size: number;
  total: number;
  content: BandaResponseDTO[];
};

const initial: State = { loading: false, error: null, sortDir: 'asc', page: 0, size: 10, total: 0, content: [] };
export const bandList$ = new BehaviorSubject<State>(initial);

export const BandFacade = {
  setSortDir(sortDir: SortDir) { bandList$.next({ ...bandList$.value, sortDir, page: 0 }); },
  setPage(page: number, size: number) { bandList$.next({ ...bandList$.value, page, size }); },
  async load() {
    const s = bandList$.value;
    bandList$.next({ ...s, loading: true, error: null });
    try {
      const catalog = await AlbumFacade.loadCatalog();
      if (catalog.bands.length) {
        const sorted = sortBands(catalog.bands, s.sortDir);
        const start = s.page * s.size;
        const content = sorted.slice(start, start + s.size);
        bandList$.next({
          ...bandList$.value,
          loading: false,
          content,
          total: sorted.length,
          error: catalog.error
        });
        return;
      }

      const { data } = await BandaService.listarPaginado({ page: s.page, size: s.size, sortDir: s.sortDir });
      bandList$.next({
        ...bandList$.value,
        loading: false,
        content: data.content ?? [],
        total: data.totalElements ?? 0
      });
    } catch (e: any) {
      bandList$.next({ ...bandList$.value, loading: false, error: e?.message ?? 'Erro ao buscar bandas' });
    }
  }
};

function sortBands(list: BandaResponseDTO[], dir: SortDir) {
  return [...list].sort((a, b) => {
    const an = (a.nomeBanda ?? '').toLowerCase();
    const bn = (b.nomeBanda ?? '').toLowerCase();
    return dir === 'asc' ? an.localeCompare(bn) : bn.localeCompare(an);
  });
}
