package artistalbum.domain.banda.model;

import com.seplag.artistalbum.domain.banda.model.BandaModel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BandaModelTest {

    @Test
    void shouldStoreBandData() {
        BandaModel banda = new BandaModel();

        banda.setIdBanda(3L);
        banda.setNomeBanda("Os Mutantes");

        assertEquals(3L, banda.getIdBanda());
        assertEquals("Os Mutantes", banda.getNomeBanda());
        assertTrue(banda.getArtistas().isEmpty());
    }
}