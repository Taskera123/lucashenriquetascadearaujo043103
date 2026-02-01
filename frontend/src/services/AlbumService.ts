import { api } from './api';
import type { AlbumCapaDTO, AlbumDTO, AlbumRequestDTO, AlbumResponseDTO, Page } from '../types/api';

export const AlbumService = {
  // POST /v1/albums
  criar(payload: AlbumRequestDTO) {
    return api.post<AlbumResponseDTO>('/v1/albums', payload);
  },

  // GET /v1/albums/{idAlbum}
  obterPorId(idAlbum: number) {
    return api.get<AlbumResponseDTO>(`/v1/albums/${idAlbum}`);
  },

  // PUT /v1/albums/{idAlbum}
  atualizar(idAlbum: number, payload: AlbumRequestDTO) {
    return api.put<AlbumResponseDTO>(`/v1/albums/${idAlbum}`, payload);
  },

  // DELETE /v1/albums/{idAlbum}
  deletar(idAlbum: number) {
    return api.delete<void>(`/v1/albums/${idAlbum}`);
  },

  // GET /v1/albums/artista/{idArtista}?pagina=0&tamanho=10
  listarPorArtistaPaginado(idArtista: number, params: { pagina?: number; tamanho?: number }) {
    return api.get<Page<AlbumDTO>>(`/v1/albums/artista/${idArtista}`, { params });
  },

  // GET /v1/albums/all?pagina=0&tamanho=10&ordenacao=asc|desc
  listarTodosPaginado(params: { pagina?: number; tamanho?: number; ordenacao?: 'asc' | 'desc' }) {
    return api.get<Page<AlbumDTO>>('/v1/albums/all', { params });
  },

  // GET /v1/albums/artista/{idArtista}/todos?ordenacao=asc|desc
  listarPorArtistaTodos(idArtista: number, params?: { ordenacao?: 'asc' | 'desc' }) {
    return api.get<AlbumDTO[]>(`/v1/albums/artista/${idArtista}/todos`, { params });
  },

  // GET /v1/albums/{id}/capa/url  (retorna string)
  obterUrlCapa(idAlbum: number) {
    return api.get<string>(`/v1/albums/${idAlbum}/capa/url`);
  },

  // GET /v1/albums/{id}/capas
  listarCapas(idAlbum: number) {
    return api.get<AlbumCapaDTO[]>(`/v1/albums/${idAlbum}/capas`);
  },

   definirCapaPrincipal(idAlbum: number, idCapa: number) {
    return api.put<void>(`/v1/albums/${idAlbum}/capas/${idCapa}/principal`);
  },

  // POST /v1/albums/{id}/capa  (multipart)
  uploadCapa(idAlbum: number, file: File) {
    const fd = new FormData();
    fd.append('arquivo', file);

    // ⚠️ NÃO setar Content-Type manualmente
    return api.post<AlbumDTO>(`/v1/albums/${idAlbum}/capa`, fd);
  },

  // PUT /v1/albums/{id}/capa  (multipart)
  atualizarCapa(idAlbum: number, file: File) {
    const fd = new FormData();
    fd.append('arquivo', file);

    // ⚠️ NÃO setar Content-Type manualmente
    return api.put<AlbumDTO>(`/v1/albums/${idAlbum}/capa`, fd);
  },

  // POST /v1/albums/{id}/capas  (multipart)
  adicionarCapas(idAlbum: number, files: File[]) {
    const fd = new FormData();
    files.forEach((file) => fd.append('arquivos', file));
    return api.post<AlbumDTO>(`/v1/albums/${idAlbum}/capas`, fd);
  }
};
