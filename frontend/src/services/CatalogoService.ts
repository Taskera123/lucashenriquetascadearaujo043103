import { publicApi } from './publicApi';
import type { CatalogoResponseDTO } from '../types/api';

export const CatalogoService = {
  obterCatalogo() {
    return publicApi.get<CatalogoResponseDTO>('/v1/catalogo');
  }
};
