CREATE OR REPLACE FUNCTION atualizar_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.dataAtualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* Atualiza updated_at (tabela regional) */
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


/* =========================================================
   TABELA: artista
   ========================================================= */
CREATE TABLE artista (
    idArtista BIGSERIAL PRIMARY KEY,
    nomeArtista VARCHAR(255) NOT NULL UNIQUE,
    fotoArtista VARCHAR(255),
    fotoArtistaContentType VARCHAR(100),
    dataCriacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dataAtualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idxArtistaNome ON artista (nomeArtista);

CREATE TRIGGER tgArtistaAtualizacao
BEFORE UPDATE ON artista
FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();


/* =========================================================
   TABELA: banda
   ========================================================= */
CREATE TABLE banda (
    idBanda BIGSERIAL PRIMARY KEY,
    nomeBanda VARCHAR(255) NOT NULL UNIQUE,
    dataCriacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dataAtualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idxBandaNome ON banda (nomeBanda);

CREATE TRIGGER tgBandaAtualizacao
BEFORE UPDATE ON banda
FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();


/* =========================================================
   TABELA: album
   ========================================================= */
CREATE TABLE album (
    idAlbum BIGSERIAL PRIMARY KEY,
    tituloAlbum VARCHAR(255) NOT NULL,
    idArtista BIGINT NOT NULL,
    dataCriacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dataAtualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fkAlbumArtista
        FOREIGN KEY (idArtista)
        REFERENCES artista(idArtista)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX uxAlbumArtistaTitulo ON album (idArtista, tituloAlbum);

CREATE INDEX idxAlbumArtista ON album (idArtista);
CREATE INDEX idxAlbumTitulo  ON album (tituloAlbum);

CREATE TRIGGER tgAlbumAtualizacao
BEFORE UPDATE ON album
FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();


/* =========================================================
   TABELA: bandaArtista (N:N)
   ========================================================= */
CREATE TABLE bandaArtista (
    idBanda BIGINT NOT NULL,
    idArtista BIGINT NOT NULL,
    dataCriacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pkBandaArtista PRIMARY KEY (idBanda, idArtista),

    CONSTRAINT fkBandaArtistaBanda
        FOREIGN KEY (idBanda)
        REFERENCES banda(idBanda)
        ON DELETE CASCADE,

    CONSTRAINT fkBandaArtistaArtista
        FOREIGN KEY (idArtista)
        REFERENCES artista(idArtista)
        ON DELETE CASCADE
);

CREATE INDEX idxBandaArtistaArtista ON bandaArtista (idArtista);


/* =========================================================
   TABELA: regional
   ========================================================= */
CREATE TABLE regional (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nome, ativo)
);

CREATE UNIQUE INDEX uxRegionalNomeAtivo
ON regional (nome)
WHERE ativo = true;

CREATE INDEX idxRegionalNome  ON regional (nome);
CREATE INDEX idxRegionalAtivo ON regional (ativo);

CREATE TRIGGER tgRegionalAtualizacao
BEFORE UPDATE ON regional
FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();


/* =========================================================
   TABELA: album_capa
   ========================================================= */
CREATE TABLE album_capa (
    idCapa BIGSERIAL PRIMARY KEY,
    idAlbum BIGINT NOT NULL,
    chaveObjeto VARCHAR(500) NOT NULL,
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    dataCriacao TIMESTAMP NOT NULL DEFAULT now(),
    dataAtualizacao TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fkAlbumCapaAlbum
        FOREIGN KEY (idAlbum)
        REFERENCES album(idAlbum)
        ON DELETE CASCADE
);

CREATE INDEX idxAlbumCapaAlbum ON album_capa (idAlbum);

CREATE TRIGGER tgAlbumCapaAtualizacao
BEFORE UPDATE ON album_capa
FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();


CREATE UNIQUE INDEX ux_album_capa_principal_por_album
ON album_capa (idAlbum)
WHERE principal = true;
