package artistalbum.domain.artista.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seplag.artistalbum.domain.artista.controller.ArtistaResource;
import com.seplag.artistalbum.domain.artista.dto.ArtistaRequestDTO;
import com.seplag.artistalbum.domain.artista.dto.ArtistaResponseDTO;
import com.seplag.artistalbum.domain.artista.service.ArtistaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ArtistaResource.class)
@AutoConfigureMockMvc(addFilters = false)
class ArtistaResourceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ArtistaService artistaService;

    @Test
    void criarArtistaRetornaCriado() throws Exception {
        ArtistaResponseDTO response = new ArtistaResponseDTO();
        response.setIdArtista(10L);
        response.setNomeArtista("Novo Artista");

        when(artistaService.criarArtista(any(ArtistaRequestDTO.class))).thenReturn(response);

        ArtistaRequestDTO request = new ArtistaRequestDTO();
        request.setNomeArtista("Novo Artista");

        mockMvc.perform(post("/v1/artistas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idArtista").value(10))
                .andExpect(jsonPath("$.nomeArtista").value("Novo Artista"));
    }

    @Test
    void listarTodosRetornaLista() throws Exception {
        ArtistaResponseDTO response = new ArtistaResponseDTO();
        response.setIdArtista(1L);
        response.setNomeArtista("Artista A");

        when(artistaService.listarTodos()).thenReturn(List.of(response));

        mockMvc.perform(get("/v1/artistas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idArtista").value(1))
                .andExpect(jsonPath("$[0].nomeArtista").value("Artista A"));
    }
}
