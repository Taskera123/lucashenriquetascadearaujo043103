import { api } from './api';
import type { BandaRequestDTO, BandaResponseDTO, Page, ArtistaResumoDTO } from '../types/api';

export const BandaService = {
  listarPaginado(params: { page?: number; size?: number; sortDir?: 'asc' | 'desc' }) {
    return api.get<Page<BandaResponseDTO>>('/v1/bandas/paginado', { params });
  },
  listarTodos() {
    return api.get<BandaResponseDTO[]>('/v1/bandas');
  },
  obterPorId(idBanda: number) {
    return api.get<BandaResponseDTO>(`/v1/bandas/${idBanda}`);
  },
  criar(payload: BandaRequestDTO) {
    return api.post<BandaResponseDTO>('/v1/bandas', payload);
  },
  atualizar(idBanda: number, payload: BandaRequestDTO) {
    return api.put<BandaResponseDTO>(`/v1/bandas/${idBanda}`, payload);
  },
  deletar(idBanda: number) {
    return api.delete<void>(`/v1/bandas/${idBanda}`);
  },
  listarArtistas(idBanda: number) {
    return api.get<ArtistaResumoDTO[]>(`/v1/bandas/${idBanda}/artistas`);
  },
  vincularArtista(idBanda: number, idArtista: number) {
    return api.post<void>(`/v1/bandas/${idBanda}/artistas`, { idArtista });
  },
  desvincularArtista(idBanda: number, idArtista: number) {
    return api.delete<void>(`/v1/bandas/${idBanda}/artistas/${idArtista}`);
  }
};
