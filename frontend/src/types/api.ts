export type SortDir = 'asc' | 'desc';

export type Pageable = {
  pageNumber?: number;
  pageSize?: number;
  offset?: number;
  paged?: boolean;
  unpaged?: boolean;
};

export type Page<T> = {
  totalPages?: number;
  totalElements?: number;
  pageable?: Pageable;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: T[];
  number?: number;
  numberOfElements?: number;
  empty?: boolean;
};

export type LoginRequest = { username: string; password: string; };
export type LoginResponse = { token?: string; type?: string; expiresIn?: number; tokenWithType?: string; };

export type ArtistaRequestDTO = { nomeArtista: string; };
export type ArtistaResponseDTO = {
  quantidadeAlbuns: number; idArtista?: number; nomeArtista?: string; urlFoto?: string | null; dataCriacao?: string; dataAtualizacao?: string; 
};

export type AlbumDTO = {
  id?: number;
  titulo?: string;
  idArtista?: number;
  nomeArtista?: string;
  urlImagemCapa?: string;
  urlImagemCapaAssinada?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
};

export type AlbumCapaDTO = {
  idCapa?: number;
  chaveObjeto?: string;
  urlAssinada?: string | null;
  principal?: boolean;
};

export type BandaResumoDTO = {
  idBanda?: number;
  nomeBanda?: string;
};

export type ArtistaResumoDTO = {
  idArtista?: number;
  nomeArtista?: string;
};

export type ArtistaDTO = {
  id?: number;
  nome?: string;
  albuns?: AlbumDTO[];
  quantidadeAlbuns?: number;
  urlFoto?: string | null;
  dataCriacao?: string;
  dataAtualizacao?: string;
  bandas?: BandaResumoDTO[];
};

export type BandaRequestDTO = { nomeBanda: string; };
export type BandaResponseDTO = {
  idBanda?: number;
  nomeBanda?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
  artistas?: ArtistaResumoDTO[];
};

export type AlbumRequestDTO = { tituloAlbum: string; capaAlbum?: string; idArtista: number; };
export type AlbumResponseDTO = { idAlbum?: number; tituloAlbum?: string; capaAlbum?: string; idArtista?: number; nomeArtista?: string; dataCriacao?: string; dataAtualizacao?: string; };

export type CatalogoResponseDTO = {
  artistas?: ArtistaResponseDTO[];
  albuns?: AlbumDTO[];
  bandas?: BandaResponseDTO[];
};
