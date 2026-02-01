package com.seplag.artistalbum.domain.artista.model;

import com.seplag.artistalbum.domain.album.model.AlbumModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "artista",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_artista_nomeArtista", columnNames = "nomeArtista")
        })
public class ArtistaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idArtista")
    private Long idArtista;

    @NotBlank(message = "Nome do artista é obrigatório")
    @Size(max = 255, message = "Nome do artista não deve passar de  255 caracteres!")
    @Column(name = "nomeArtista",nullable = false, unique = true)
    private String nomeArtista;

    @Column(name = "fotoArtista")
    private String fotoArtista;

    @Column(name = "fotoArtistaContentType")
    private String fotoArtistaContentType;

    @OneToMany(mappedBy = "artista", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AlbumModel> albuns = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "dataCriacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @UpdateTimestamp
    @Column(name = "dataAtualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    /* =========================
      Callbacks
      ========================= */
    @PrePersist
    protected void onCreate() {
        this.dataCriacao = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    public ArtistaModel() {}

    public ArtistaModel(String nome) {
        this.nomeArtista = nome;
    }

    public Long getIdArtista() {
        return idArtista;
    }

    public void setIdArtista(Long idArtista) {
        this.idArtista = idArtista;
    }

    public String getNomeArtista() {
        return nomeArtista;
    }

    public void setNomeArtista(String nome) {
        this.nomeArtista = nome;
    }

    public String getFotoArtista() {
        return fotoArtista;
    }

    public void setFotoArtista(String fotoArtista) {
        this.fotoArtista = fotoArtista;
    }

    public String getFotoArtistaContentType() {
        return fotoArtistaContentType;
    }

    public void setFotoArtistaContentType(String fotoArtistaContentType) {
        this.fotoArtistaContentType = fotoArtistaContentType;
    }

    public List<AlbumModel> getAlbuns() {
        return albuns;
    }

    public void setAlbuns(List<AlbumModel> albuns) {
        this.albuns = albuns;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ArtistaModel artista = (ArtistaModel) o;
        return Objects.equals(idArtista, artista.idArtista);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idArtista);
    }

    @Override
    public String toString() {
        return "Artista{" +
                "id=" + idArtista +
                ", nome='" + nomeArtista + '\'' +
                ", quantidadeAlbuns=" + (albuns != null ? albuns.size() : 0) +
                '}';
    }
}
