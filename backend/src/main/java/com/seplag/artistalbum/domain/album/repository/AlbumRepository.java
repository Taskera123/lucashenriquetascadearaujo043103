package com.seplag.artistalbum.domain.album.repository;

import com.seplag.artistalbum.domain.album.model.AlbumModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlbumRepository extends JpaRepository<AlbumModel, Long> {

    // Verifica duplicidade (reforça o unique index do banco)
    boolean existsByArtista_IdArtistaAndTituloAlbumIgnoreCase(Long idArtista, String tituloAlbum);

    // Busca álbum específico pelo artista + título
    Optional<AlbumModel> findByArtista_IdArtistaAndTituloAlbumIgnoreCase(Long idArtista, String tituloAlbum);

    // Se você quiser retornar já com artista (evita LAZY em alguns cenários)
    @EntityGraph(attributePaths = {"artista"})
    Optional<AlbumModel> findWithArtistaByIdAlbum(Long idAlbum);

    // Busca geral, já com artista (útil para listagens)
    @EntityGraph(attributePaths = {"artista"})
    List<AlbumModel> findAll();

    @Query("SELECT a FROM AlbumModel a WHERE a.artista.idArtista = :idArtista ORDER BY a.tituloAlbum ASC")
    Page<AlbumModel> findByArtistaIdOrderByTitulo(@Param("idArtista") Long idArtista, Pageable pageable);

    @Query("SELECT a FROM AlbumModel a WHERE a.artista.idArtista = :idArtista ORDER BY a.tituloAlbum ASC")
    List<AlbumModel> findByArtistaIdOrderByTituloAsc(@Param("idArtista") Long idArtista);

    @Query("SELECT a FROM AlbumModel a WHERE a.artista.idArtista = :idArtista ORDER BY a.tituloAlbum DESC")
    List<AlbumModel> findByArtistaIdOrderByTituloDesc(@Param("idArtista") Long idArtista);

    @Query("SELECT COUNT(a) FROM AlbumModel a WHERE a.artista.idArtista = :idArtista")
    Long countByArtistaId(@Param("idArtista") Long idArtista);

    @EntityGraph(attributePaths = {"artista"})
    Page<AlbumModel> findAll(Pageable pageable);

    Page<AlbumModel> findAllByArtista_IdArtista(Long idArtista, Pageable pageable);

    List<AlbumModel> findByArtista_IdArtistaOrderByTituloAlbumAsc(Long idArtista);
}
