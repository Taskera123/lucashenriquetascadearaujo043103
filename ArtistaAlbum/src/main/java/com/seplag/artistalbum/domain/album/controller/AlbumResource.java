package com.seplag.artistalbum.domain.album.controller;

import com.seplag.artistalbum.domain.album.dto.AlbumCapaDTO;
import com.seplag.artistalbum.domain.album.dto.AlbumDTO;
import com.seplag.artistalbum.domain.album.dto.AlbumRequestDTO;
import com.seplag.artistalbum.domain.album.dto.AlbumResponseDTO;
import com.seplag.artistalbum.domain.album.model.AlbumModel;
import com.seplag.artistalbum.domain.album.repository.AlbumRepository;
import com.seplag.artistalbum.domain.album.service.AlbumService;
import com.seplag.artistalbum.shared.exception.ResourceNotFoundException;
import com.seplag.artistalbum.shared.service.MinioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/v1/albums")
@Tag(name = "Álbuns", description = "APIs de gerenciamento de álbuns")
public class AlbumResource {

    private final AlbumService albumService;
    private final MinioService minioService;

    private final AlbumRepository albumRepository;

    public AlbumResource(AlbumService albumService, MinioService minioService, AlbumRepository albumRepository) {
        this.albumService = albumService;
        this.minioService = minioService;
        this.albumRepository = albumRepository;
    }

    /* =========================
      CREATE
      POST /albums
      ========================= */
    @PostMapping
    public ResponseEntity<AlbumResponseDTO> criarAlbum(@Valid @RequestBody AlbumRequestDTO request) {
        AlbumResponseDTO criado = albumService.criarAlbum(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    /* =========================
       READ
       GET /albums/{idAlbum}
       ========================= */
    @GetMapping("/{idAlbum}")
    public ResponseEntity<AlbumResponseDTO> obterAlbumPorId(@PathVariable Long idAlbum) {
        AlbumResponseDTO dto = albumService.obterAlbumPorId(idAlbum);
        return ResponseEntity.ok(dto);
    }

    /* =========================
       UPDATE
       PUT /albums/{idAlbum}
       ========================= */
    @PutMapping("/{idAlbum}")
    public ResponseEntity<AlbumResponseDTO> atualizarAlbum(
            @PathVariable Long idAlbum,
            @Valid @RequestBody AlbumRequestDTO request
    ) {
        AlbumResponseDTO atualizado = albumService.atualizarAlbum(idAlbum, request);
        return ResponseEntity.ok(atualizado);
    }

    /* =========================
       DELETE
       DELETE /albums/{idAlbum}
       ========================= */
    @DeleteMapping("/{idAlbum}")
    public ResponseEntity<Void> deletarAlbum(@PathVariable Long idAlbum) {
        albumService.deletarAlbum(idAlbum);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/capa", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Fazer upload da imagem de capa do álbum")
    public ResponseEntity<AlbumDTO> fazerUploadImagemCapa(
            @Parameter(description = "ID do álbum") @PathVariable Long id,
            @Parameter(description = "Arquivo da imagem de capa") @RequestParam("arquivo") MultipartFile arquivo) {

        try {
            String tipoConteudo = arquivo.getContentType();
            if (tipoConteudo == null || !tipoConteudo.startsWith("image/")) {
                return ResponseEntity.badRequest().build();
            }

            AlbumDTO album = albumService.fazerUploadImagemCapa(id, arquivo.getBytes(), arquivo.getOriginalFilename(), tipoConteudo);
            return ResponseEntity.ok(album);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(value = "/{id}/capas", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Fazer upload de uma ou mais imagens de capa do álbum")
    public ResponseEntity<AlbumDTO> adicionarCapasAlbum(
            @Parameter(description = "ID do álbum") @PathVariable Long id,
            @Parameter(description = "Arquivos das imagens de capa") @RequestParam("arquivos") List<MultipartFile> arquivos) {
        try {
            List<AlbumService.UploadCapa> uploads = new ArrayList<>();
            for (MultipartFile arquivo : arquivos) {
                String tipoConteudo = arquivo.getContentType();
                if (tipoConteudo == null || !tipoConteudo.startsWith("image/")) {
                    return ResponseEntity.badRequest().build();
                }
                uploads.add(new AlbumService.UploadCapa(arquivo.getOriginalFilename(), arquivo.getBytes(), tipoConteudo));
            }

            AlbumDTO album = albumService.adicionarCapas(id, uploads);
            return ResponseEntity.ok(album);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping(value = "/{id}/capa", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "atualizar imagem de capa do álbum")
    public ResponseEntity<AlbumDTO> atualizarUploadImagemCapa(
            @Parameter(description = "ID do álbum") @PathVariable Long id,
            @Parameter(description = "Arquivo da imagem de capa") @RequestParam("arquivo") MultipartFile arquivo) {

        try {
            String tipoConteudo = arquivo.getContentType();
            if (tipoConteudo == null || !tipoConteudo.startsWith("image/")) {
                return ResponseEntity.badRequest().build();
            }

            AlbumDTO album = albumService.attImagemCapa(id, arquivo.getBytes(), arquivo.getOriginalFilename(), tipoConteudo);
            return ResponseEntity.ok(album);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/capa/{idAlbum}")
    @Operation(summary = "Obter imagem de capa do álbum")
    public ResponseEntity<Resource> obterImagemCapaAlbum(@Parameter(description = "ID do álbum") @PathVariable Long idAlbum) {
        try {
            AlbumResponseDTO album = albumService.obterAlbumPorId(idAlbum);

            String capaAlbum = album.getCapaAlbum();
            if (capaAlbum == null) {
                return ResponseEntity.notFound().build();
            }
            byte[] dadosImagem = minioService.downloadFile(capaAlbum);
            String tipoConteudo = "image/jpeg";
            if (capaAlbum.toLowerCase().endsWith(".png")) {
                tipoConteudo = "image/png";
            } else if (capaAlbum.toLowerCase().endsWith(".gif")) {
                tipoConteudo = "image/gif";
            }
            ByteArrayResource recurso = new ByteArrayResource(dadosImagem);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(tipoConteudo))
                    .contentLength(dadosImagem.length)
                    .body(recurso);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/capas")
    @Operation(summary = "Listar capas do álbum")
    public ResponseEntity<List<AlbumCapaDTO>> listarCapas(@PathVariable Long id) {
        List<AlbumCapaDTO> capas = albumService.listarCapas(id);
        return ResponseEntity.ok(capas);
    }

    @PutMapping("/{id}/capas/{idCapa}/principal")
    @Operation(summary = "Definir capa principal do álbum")
    public ResponseEntity<Void> definirCapaPrincipal(
            @PathVariable Long id,
            @PathVariable Long idCapa
    ) {
        albumService.definirCapaPrincipal(id, idCapa);
        return ResponseEntity.noContent().build();
    }
    /* =========================

       ========================= */
    @GetMapping("/artista/{idArtista}")
    @Operation(summary = "Obter álbuns por artista com paginação")
    public ResponseEntity<Page<AlbumDTO>> obterAlbunsPorArtista(
            @Parameter(description = "ID do artista") @PathVariable Long idArtista,
            @Parameter(description = "Número da página (baseado em 0)") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Número de itens por página") @RequestParam(defaultValue = "10") int tamanho) {

        Pageable paginacao = PageRequest.of(pagina, tamanho);
        Page<AlbumDTO> albuns = albumService.obterAlbunsPorArtista(idArtista, paginacao);
        return ResponseEntity.ok(albuns);
    }

    @GetMapping("/all")
    @Operation(summary = "Listar todos os álbuns com paginação e ordenação")
    public ResponseEntity<Page<AlbumDTO>> listarTodosAlbuns(
            @Parameter(description = "Número da página (baseado em 0)") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Número de itens por página") @RequestParam(defaultValue = "10") int tamanho,
            @Parameter(description = "Direção da ordenação (asc ou desc)") @RequestParam(defaultValue = "asc") String ordenacao) {

        Pageable paginacao = PageRequest.of(pagina, tamanho);
        Page<AlbumDTO> albuns = albumService.listarTodosAlbuns(paginacao, ordenacao);
        return ResponseEntity.ok(albuns);
    }

    @GetMapping("/artista/{idArtista}/todos")
    @Operation(summary = "Obter todos os álbuns por artista sem paginação")
    public ResponseEntity<List<AlbumDTO>> obterTodosAlbunsPorArtista(
            @Parameter(description = "ID do artista") @PathVariable Long idArtista,
            @Parameter(description = "Direção da ordenação (asc ou desc)") @RequestParam(defaultValue = "asc") String ordenacao) {

        List<AlbumDTO> albuns = albumService.obterTodosAlbunsPorArtista(idArtista, ordenacao);
        return ResponseEntity.ok(albuns);
    }

    @GetMapping("/{id}/capa/url")
    @Operation(summary = "Endpoint só pra pegar a URL da imagem da foto")
    public ResponseEntity<String> obterUrlCapa(@PathVariable Long id) {
        AlbumModel album = albumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum não encontrado com id: " + id));

        String chave = (album.getCapas() != null && !album.getCapas().isEmpty())
                ? album.getCapas().get(0).getChaveObjeto()
                : null;
        if (chave == null) return ResponseEntity.noContent().build();

        try {
            String url = minioService.generatePresignedUrl(chave, 30 * 60);
            return ResponseEntity.ok(url);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
