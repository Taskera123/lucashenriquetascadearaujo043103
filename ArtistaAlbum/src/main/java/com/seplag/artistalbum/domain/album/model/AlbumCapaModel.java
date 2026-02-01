package com.seplag.artistalbum.domain.album.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "album_capa")
public class AlbumCapaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idCapa")
    private Long idCapa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idAlbum", nullable = false)
    private AlbumModel album;

    @NotBlank(message = "Chave da capa é obrigatória")
    @Size(max = 500, message = "Chave da capa não deve exceder 500 caracteres")
    @Column(name = "chaveObjeto", nullable = false)
    private String chaveObjeto;

    @Column(name = "principal", nullable = false)
    private boolean principal = false;

    @CreationTimestamp
    @Column(name = "dataCriacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @UpdateTimestamp
    @Column(name = "dataAtualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    public AlbumCapaModel() {}

    public AlbumCapaModel(AlbumModel album, String chaveObjeto) {
        this.album = album;
        this.chaveObjeto = chaveObjeto;
    }

    public Long getIdCapa() {
        return idCapa;
    }

    public AlbumModel getAlbum() {
        return album;
    }

    public void setAlbum(AlbumModel album) {
        this.album = album;
    }

    public String getChaveObjeto() {
        return chaveObjeto;
    }

    public void setChaveObjeto(String chaveObjeto) {
        this.chaveObjeto = chaveObjeto;
    }

    public boolean isPrincipal() {
        return principal;
    }

    public void setPrincipal(boolean principal) {
        this.principal = principal;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AlbumCapaModel that = (AlbumCapaModel) o;
        return Objects.equals(idCapa, that.idCapa);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idCapa);
    }
}
