import { api } from './api';
import type { ArtistaRequestDTO, ArtistaResponseDTO, Page, ArtistaDTO } from '../types/api';

export const ArtistService = {
  pesquisar(params: { nome: string; pagina?: number; tamanho?: number }) {
    return api.get<Page<ArtistaDTO>>('/v1/artistas/pesquisa', { params });
  },

  listarTodos(params: { pagina?: number; tamanho?: number; ordenacao?: 'asc' | 'desc' }) {
    return api.get<Page<ArtistaDTO>>('/v1/artistas/all', { params });
  },

  obterPorId(idArtista: number) {
    return api.get<ArtistaResponseDTO>(`/v1/artistas/${idArtista}`);
  },
  criar(payload: ArtistaRequestDTO) {
    return api.post<ArtistaResponseDTO>('/v1/artistas', payload);
  },
  atualizar(idArtista: number, payload: ArtistaRequestDTO) {
    return api.put<ArtistaResponseDTO>(`/v1/artistas/${idArtista}`, payload);
  },
  atualizarFoto(idArtista: number, file: File) {
    const fd = new FormData();
    fd.append('arquivo', file);
    return api.put<ArtistaResponseDTO>(`/v1/artistas/${idArtista}/foto`, fd);
  },
  deletar(idArtista: number) {
    return api.delete<void>(`/v1/artistas/${idArtista}`);
  }
};
