package com.seplag.artistalbum.domain.banda.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class BandaArtistaId implements Serializable {
    @Column(name = "idBanda")
    private Long idBanda;

    @Column(name = "idArtista")
    private Long idArtista;

    public BandaArtistaId() {
    }

    public BandaArtistaId(Long idBanda, Long idArtista) {
        this.idBanda = idBanda;
        this.idArtista = idArtista;
    }

    public Long getIdBanda() {
        return idBanda;
    }

    public void setIdBanda(Long idBanda) {
        this.idBanda = idBanda;
    }

    public Long getIdArtista() {
        return idArtista;
    }

    public void setIdArtista(Long idArtista) {
        this.idArtista = idArtista;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BandaArtistaId)) return false;
        BandaArtistaId that = (BandaArtistaId) o;
        return Objects.equals(idBanda, that.idBanda)
                && Objects.equals(idArtista, that.idArtista);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idBanda, idArtista);
    }
}
