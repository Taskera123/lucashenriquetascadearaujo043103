package com.seplag.artistalbum.domain.album.model;

import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "album",
        uniqueConstraints = {
            @UniqueConstraint(name = "uk_album_idArtista_tituloAlbum", columnNames = {"idArtista", "tituloAlbum"})
        })
public class AlbumModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idAlbum")
    private Long idAlbum;

    @NotBlank(message = "Título do álbum é obrigatório")
    @Size(max = 255, message = "Título do álbum não deve passar 255 caracteres")
    @Column(name = "tituloAlbum", nullable = false)
    private String tituloAlbum;

    @NotNull(message = "Artista é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idArtista", nullable = false)
    private ArtistaModel artista;

    @OneToMany(mappedBy = "album", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("principal DESC, dataCriacao ASC")
    private List<AlbumCapaModel> capas = new ArrayList<>();

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

    public AlbumModel() {}

    public AlbumModel(String tituloAlbum, ArtistaModel artista) {
        this.tituloAlbum = tituloAlbum;
        this.artista = artista;
    }

    public Long getIdAlbum() {
        return idAlbum;
    }

    public void setIdAlbum(Long id) {
        this.idAlbum = id;
    }

    public String getTituloAlbum() {
        return tituloAlbum;
    }

    public void setTituloAlbum(String tituloAlbum) {
        this.tituloAlbum = tituloAlbum;
    }

    public ArtistaModel getArtista() {
        return artista;
    }

    public void setArtista(ArtistaModel artista) {
        this.artista = artista;
    }

    public List<AlbumCapaModel> getCapas() {
        return capas;
    }

    public void setCapas(List<AlbumCapaModel> capas) {
        this.capas = capas;
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
        AlbumModel albumModel = (AlbumModel) o;
        return Objects.equals(idAlbum, albumModel.idAlbum);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idAlbum);
    }

    @Override
    public String toString() {
        return "Album{" +
                "id=" + idAlbum +
                ", titulo='" + tituloAlbum + '\'' +
                ", artista='" + (artista != null ? artista.getNomeArtista() : null) + '\'' +
                ", capas='" + (capas != null ? capas.size() : 0) + '\'' +
                '}';
    }
}
