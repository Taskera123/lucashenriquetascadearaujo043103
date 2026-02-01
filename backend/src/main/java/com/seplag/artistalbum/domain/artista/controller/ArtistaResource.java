package com.seplag.artistalbum.domain.artista.controller;

import com.seplag.artistalbum.domain.artista.dto.ArtistaDTO;
import com.seplag.artistalbum.domain.artista.dto.ArtistaRequestDTO;
import com.seplag.artistalbum.domain.artista.dto.ArtistaResponseDTO;
import com.seplag.artistalbum.domain.artista.service.ArtistaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/artistas")
@Tag(name = "Artistas", description = "APIs de gerenciamento de artistas")
public class ArtistaResource {

    @Autowired
    private final ArtistaService artistaService;

    public ArtistaResource(ArtistaService artistaService) {
        this.artistaService = artistaService;
    }

    /* CREATE */
    @PostMapping
    public ResponseEntity<ArtistaResponseDTO> criar(@Valid @RequestBody ArtistaRequestDTO request) {
        ArtistaResponseDTO criado = artistaService.criarArtista(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    /* READ by id */
    @GetMapping("/{idArtista}")
    public ResponseEntity<ArtistaResponseDTO> obterPorId(@PathVariable Long idArtista) {
        return ResponseEntity.ok(artistaService.obterArtistaPorId(idArtista));
    }

    /* READ list */
    @GetMapping
    public ResponseEntity<List<ArtistaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(artistaService.listarTodos());
    }

    /* READ paged */
    @GetMapping("/paginado")
    public ResponseEntity<Page<ArtistaResponseDTO>> listarPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        return ResponseEntity.ok(artistaService.listarPaginado(page, size, sortDir));
    }

    /* UPDATE */
    @PutMapping("/{idArtista}")
    public ResponseEntity<ArtistaResponseDTO> atualizar(
            @PathVariable Long idArtista,
            @Valid @RequestBody ArtistaRequestDTO request
    ) {
        return ResponseEntity.ok(artistaService.atualizarArtista(idArtista, request));
    }

    @PutMapping(value = "/{idArtista}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Atualizar foto do artista")
    public ResponseEntity<ArtistaResponseDTO> atualizarFoto(
            @Parameter(description = "ID do artista") @PathVariable Long idArtista,
            @Parameter(description = "Arquivo da foto") @RequestParam("arquivo") MultipartFile arquivo) {
        try {
            String tipoConteudo = arquivo.getContentType();
            if (tipoConteudo == null || !tipoConteudo.startsWith("image/")) {
                return ResponseEntity.badRequest().build();
            }
            ArtistaResponseDTO dto = artistaService.atualizarFotoArtista(
                    idArtista,
                    arquivo.getBytes(),
                    arquivo.getOriginalFilename(),
                    tipoConteudo
            );
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{idArtista}/foto")
    @Operation(summary = "Obter foto do artista")
    public ResponseEntity<Resource> obterFoto(@Parameter(description = "ID do artista") @PathVariable Long idArtista) {
        try {
            ArtistaService.FotoArtista foto = artistaService.obterFotoArtista(idArtista);
            ByteArrayResource recurso = new ByteArrayResource(foto.dados());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(foto.tipoConteudo()))
                    .contentLength(foto.dados().length)
                    .body(recurso);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /* DELETE */
    @DeleteMapping("/{idArtista}")
    public ResponseEntity<Void> deletar(@PathVariable Long idArtista) {
        artistaService.deletarArtista(idArtista);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pesquisa")
    @Operation(summary = "Pesquisar artistas por nome")
    public ResponseEntity<Page<ArtistaDTO>> pesquisarArtistas(
            @Parameter(description = "Termo de pesquisa") @RequestParam String nome,
            @Parameter(description = "Número da página (baseado em 0)") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Número de itens por página") @RequestParam(defaultValue = "10") int tamanho) {

        Pageable paginacao = PageRequest.of(pagina, tamanho);
        Page<ArtistaDTO> artistas = artistaService.pesquisarArtistas(nome, paginacao);
        return ResponseEntity.ok(artistas);
    }

    @GetMapping("/all")
    @Operation(summary = "Listar todos os artistas com paginação e ordenação")
    public ResponseEntity<Page<ArtistaDTO>> obterTodosArtistas(
            @Parameter(description = "Número da página (baseado em 0)") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Número de itens por página") @RequestParam(defaultValue = "10") int tamanho,
            @Parameter(description = "Direção da ordenação (asc ou desc)") @RequestParam(defaultValue = "asc") String ordenacao) {

        Pageable paginacao = PageRequest.of(pagina, tamanho);
        Page<ArtistaDTO> artistas = artistaService.obterTodosArtistas(paginacao, ordenacao);
        return ResponseEntity.ok(artistas);
    }

}
