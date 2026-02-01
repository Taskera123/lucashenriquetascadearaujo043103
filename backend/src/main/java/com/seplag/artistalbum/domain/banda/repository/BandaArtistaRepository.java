package com.seplag.artistalbum.domain.banda.repository;

import com.seplag.artistalbum.domain.banda.model.BandaArtistaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BandaArtistaRepository extends JpaRepository<BandaArtistaModel, Long> {

    List<BandaArtistaModel> findByBanda_IdBanda(Long idBanda);

    List<BandaArtistaModel> findByArtista_IdArtista(Long idArtista);

    @Query("select ba from BandaArtistaModel ba join fetch ba.banda where ba.artista.idArtista = :idArtista")
    List<BandaArtistaModel> findByArtistaIdWithBanda(@Param("idArtista") Long idArtista);

    boolean existsByBanda_IdBandaAndArtista_IdArtista(Long idBanda, Long idArtista);

    void deleteByBanda_IdBandaAndArtista_IdArtista(Long idBanda, Long idArtista);

}
