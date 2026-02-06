package artistalbum.domain.album.model;
import com.seplag.artistalbum.domain.album.model.AlbumModel;
import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AlbumModelTest {

    @Test
    void shouldStoreTitleArtistAndId() {
        ArtistaModel artista = new ArtistaModel("Djavan");
        AlbumModel album = new AlbumModel("Luz", artista);

        album.setIdAlbum(10L);

        assertEquals(10L, album.getIdAlbum());
        assertEquals("Luz", album.getTituloAlbum());
        assertSame(artista, album.getArtista());
        assertTrue(album.toString().contains("Luz"));
    }
}