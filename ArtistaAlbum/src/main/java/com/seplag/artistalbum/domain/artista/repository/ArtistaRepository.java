package com.seplag.artistalbum.domain.artista.repository;

import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
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
public interface ArtistaRepository extends JpaRepository<ArtistaModel, Long> {

    Optional<ArtistaModel> findByNomeArtista(String nomeArtista);

    boolean existsByNomeArtista(String nomeArtista);

    boolean existsByNomeArtistaIgnoreCase(String nomeArtista);

    Optional<ArtistaModel> findByNomeArtistaIgnoreCase(String nomeArtista);

    // Para listar artistas já trazendo álbuns (evita N+1)
    @EntityGraph(attributePaths = {"albuns"})
    List<ArtistaModel> findAll();

    // Para pegar 1 artista com álbuns
    @EntityGraph(attributePaths = {"albuns"})
    Optional<ArtistaModel> findWithAlbunsByIdArtista(Long idArtista);

    @Query("SELECT a FROM ArtistaModel a WHERE LOWER(a.nomeArtista) LIKE LOWER(CONCAT('%', :nomeArtista, '%'))")
    Page<ArtistaModel> findByNomeContainingIgnoreCase(@Param("nomeArtista") String nomeArtista, Pageable pageable);

    @Query("SELECT a FROM ArtistaModel a ORDER BY a.nomeArtista ASC")
    Page<ArtistaModel> findAllOrderByNomeAsc(Pageable pageable);

    @Query("SELECT a FROM ArtistaModel a ORDER BY a.nomeArtista DESC")
    Page<ArtistaModel> findAllOrderByNomeDesc(Pageable pageable);
}
