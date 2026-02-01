/* =========================================================
   INSERÇÃO DE ARTISTAS
   ========================================================= */
INSERT INTO artista (nomeArtista) VALUES
('Serj Tankian'),
('Mike Shinoda'),
('Michel Teló'),
('Axl Rose');

/* =========================================================
   INSERÇÃO DE BANDAS
   ========================================================= */
INSERT INTO banda (nomeBanda) VALUES
('System of a Down'),
('Linkin Park'),
('Guns N'' Roses');

/* =========================================================
   RELACIONAMENTO BANDA ⇄ ARTISTA
   ========================================================= */

-- Serj Tankian → System of a Down
INSERT INTO bandaArtista (idBanda, idArtista)
VALUES (
    (SELECT idBanda FROM banda WHERE nomeBanda = 'System of a Down'),
    (SELECT idArtista FROM artista WHERE nomeArtista = 'Serj Tankian')
);

-- Mike Shinoda → Linkin Park
INSERT INTO bandaArtista (idBanda, idArtista)
VALUES (
    (SELECT idBanda FROM banda WHERE nomeBanda = 'Linkin Park'),
    (SELECT idArtista FROM artista WHERE nomeArtista = 'Mike Shinoda')
);

-- Axl Rose → Guns N' Roses
INSERT INTO bandaArtista (idBanda, idArtista)
VALUES (
    (SELECT idBanda FROM banda WHERE nomeBanda = 'Guns N'' Roses'),
    (SELECT idArtista FROM artista WHERE nomeArtista = 'Axl Rose')
);

/* =========================================================
   INSERÇÃO DE ÁLBUNS
   ========================================================= */

-- Álbuns do Serj Tankian
INSERT INTO album (tituloAlbum, idArtista) VALUES
('Harakiri', (SELECT idArtista FROM artista WHERE nomeArtista = 'Serj Tankian')),
('Black Blooms', (SELECT idArtista FROM artista WHERE nomeArtista = 'Serj Tankian')),
('The Rough Dog', (SELECT idArtista FROM artista WHERE nomeArtista = 'Serj Tankian'));

-- Álbuns do Mike Shinoda
INSERT INTO album (tituloAlbum, idArtista) VALUES
('The Rising Tied', (SELECT idArtista FROM artista WHERE nomeArtista = 'Mike Shinoda')),
('Post Traumatic', (SELECT idArtista FROM artista WHERE nomeArtista = 'Mike Shinoda')),
('Post Traumatic EP', (SELECT idArtista FROM artista WHERE nomeArtista = 'Mike Shinoda')),
('Where''d You Go', (SELECT idArtista FROM artista WHERE nomeArtista = 'Mike Shinoda'));

-- Álbuns do Michel Teló
INSERT INTO album (tituloAlbum, idArtista) VALUES
('Bem Sertanejo', (SELECT idArtista FROM artista WHERE nomeArtista = 'Michel Teló')),
('Bem Sertanejo - O Show (Ao Vivo)', (SELECT idArtista FROM artista WHERE nomeArtista = 'Michel Teló')),
('Bem Sertanejo - (1ª Temporada) - EP', (SELECT idArtista FROM artista WHERE nomeArtista = 'Michel Teló'));

-- Álbuns do Axl Rose (Guns N' Roses)
INSERT INTO album (tituloAlbum, idArtista) VALUES
('Use Your Illusion I', (SELECT idArtista FROM artista WHERE nomeArtista = 'Axl Rose')),
('Use Your Illusion II', (SELECT idArtista FROM artista WHERE nomeArtista = 'Axl Rose')),
('Greatest Hits', (SELECT idArtista FROM artista WHERE nomeArtista = 'Axl Rose'));
