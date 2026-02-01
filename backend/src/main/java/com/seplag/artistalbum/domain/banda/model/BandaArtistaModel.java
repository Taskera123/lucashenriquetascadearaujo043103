package com.seplag.artistalbum.domain.banda.model;

import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bandaArtista")
public class BandaArtistaModel {

    @EmbeddedId
    private BandaArtistaId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idBanda")
    @JoinColumn(name = "idBanda", nullable = false)
    private BandaModel banda;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idArtista")
    @JoinColumn(name = "idArtista", nullable = false)
    private ArtistaModel artista;

    @Column(name = "dataCriacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    public BandaArtistaModel() {
    }

    @PrePersist
    protected void onCreate() {
        this.dataCriacao = LocalDateTime.now();
    }

    public BandaArtistaId getId() {
        return id;
    }

    public void setId(BandaArtistaId id) {
        this.id = id;
    }

    public BandaModel getBanda() {
        return banda;
    }

    public void setBanda(BandaModel banda) {
        this.banda = banda;
    }

    public ArtistaModel getArtista() {
        return artista;
    }

    public void setArtista(ArtistaModel artista) {
        this.artista = artista;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }
}
