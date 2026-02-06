package artistalbum.domain.artista.model;


import com.seplag.artistalbum.domain.album.model.AlbumModel;
import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ArtistaModelTest {

    @Test
    void shouldStoreBasicFieldsAndAlbums() {
        ArtistaModel artista = new ArtistaModel("Elis Regina");

        artista.setIdArtista(5L);
        artista.setFotoArtista("foto.jpg");
        artista.setFotoArtistaContentType("image/jpeg");

        AlbumModel album = new AlbumModel("Alucinação", artista);
        artista.getAlbuns().add(album);

        assertEquals(5L, artista.getIdArtista());
        assertEquals("Elis Regina", artista.getNomeArtista());
        assertEquals("foto.jpg", artista.getFotoArtista());
        assertEquals("image/jpeg", artista.getFotoArtistaContentType());
        assertEquals(1, artista.getAlbuns().size());
        assertTrue(artista.toString().contains("Elis Regina"));
    }
}