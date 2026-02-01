package com.seplag.artistalbum.domain.album.service;

import com.seplag.artistalbum.domain.album.dto.AlbumCapaDTO;
import com.seplag.artistalbum.domain.album.dto.AlbumDTO;
import com.seplag.artistalbum.domain.album.dto.AlbumRequestDTO;
import com.seplag.artistalbum.domain.album.dto.AlbumResponseDTO;
import com.seplag.artistalbum.domain.album.mapper.AlbumMapper;
import com.seplag.artistalbum.domain.album.model.AlbumCapaModel;
import com.seplag.artistalbum.domain.album.model.AlbumModel;
import com.seplag.artistalbum.domain.album.repository.AlbumCapaRepository;
import com.seplag.artistalbum.domain.album.repository.AlbumRepository;
import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import com.seplag.artistalbum.domain.artista.repository.ArtistaRepository;
import com.seplag.artistalbum.shared.exception.ResourceNotFoundException;
import com.seplag.artistalbum.shared.service.MinioService;
import com.seplag.artistalbum.shared.websocket.UpdateMessage;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final AlbumCapaRepository albumCapaRepository;
    private final ArtistaRepository artistaRepository;
    private final MinioService minioService;
    private final SimpMessagingTemplate messagingTemplate;

    public AlbumService(AlbumRepository albumRepository, AlbumCapaRepository albumCapaRepository, ArtistaRepository artistaRepository,
                       MinioService minioService, SimpMessagingTemplate messagingTemplate) {
        this.albumRepository = albumRepository;
        this.albumCapaRepository = albumCapaRepository;
        this.artistaRepository = artistaRepository;
        this.minioService = minioService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public AlbumResponseDTO criarAlbum(AlbumRequestDTO request) {
        ArtistaModel artista = artistaRepository.findById(request.getIdArtista())
                .orElseThrow(() -> new ResourceNotFoundException("Artista não encontrado. idArtista=" + request.getIdArtista()));

        // proteção adicional (além do índice único no banco)
        if (albumRepository.existsByArtista_IdArtistaAndTituloAlbumIgnoreCase(artista.getIdArtista(), request.getTituloAlbum())) {
            throw new DataIntegrityViolationException("Já existe um álbum com este título para o artista informado.");
        }

        AlbumModel album = new AlbumModel();
        album.setTituloAlbum(request.getTituloAlbum());
        album.setArtista(artista);

        AlbumModel salvo = albumRepository.save(album);
        if (request.getCapaAlbum() != null && !request.getCapaAlbum().isBlank()) {
            AlbumCapaModel capa = new AlbumCapaModel(salvo, request.getCapaAlbum());
            albumCapaRepository.save(capa);
        }
        enviarAtualizacao("created", salvo.getIdAlbum());
        return AlbumMapper.toResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public AlbumResponseDTO obterAlbumPorId(Long idAlbum) {
        AlbumModel album = albumRepository.findWithArtistaByIdAlbum(idAlbum)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum não encontrado. idAlbum=" + idAlbum));

        return AlbumMapper.toResponseDTO(album);
    }

    @Transactional(readOnly = true)
    public List<AlbumCapaDTO> listarCapas(Long idAlbum) {
        AlbumModel album = albumRepository.findById(idAlbum)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum não encontrado. idAlbum=" + idAlbum));

        List<AlbumCapaModel> capas = album.getCapas();
        if (capas == null || capas.isEmpty()) {
            return List.of();
        }

        List<AlbumCapaDTO> dtos = new java.util.ArrayList<>();
        for (AlbumCapaModel capa : capas) {
            String urlAssinada = null;
            try {
                urlAssinada = minioService.generatePresignedUrl30Min(capa.getChaveObjeto());
            } catch (Exception e) {
                urlAssinada = null;
            }
            dtos.add(new AlbumCapaDTO(capa.getIdCapa(), capa.getChaveObjeto(), urlAssinada, capa.isPrincipal()));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public Page<AlbumResponseDTO> obterAlbunsPorArtista(Long idArtista, int page, int size, String sortDir) {
        // valida existência do artista (opcional, mas melhora mensagem)
        if (!artistaRepository.existsById(idArtista)) {
            throw new ResourceNotFoundException("Artista não encontrado. idArtista=" + idArtista);
        }

        Sort sort = Sort.by("tituloAlbum");
        if ("desc".equalsIgnoreCase(sortDir)) {
            sort = sort.descending();
        } else {
            sort = sort.ascending();
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<AlbumModel> albuns = albumRepository.findAllByArtista_IdArtista(idArtista, pageable);

        return albuns.map(AlbumMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    public List<AlbumResponseDTO> obterTodosAlbunsPorArtista(Long idArtista) {
        if (!artistaRepository.existsById(idArtista)) {
            throw new ResourceNotFoundException("Artista não encontrado. idArtista=" + idArtista);
        }

        return albumRepository.findByArtista_IdArtistaOrderByTituloAlbumAsc(idArtista)
                .stream()
                .map(AlbumMapper::toResponseDTO)
                .toList();
    }

    @Transactional
    public AlbumResponseDTO atualizarAlbum(Long idAlbum, AlbumRequestDTO request) {
        AlbumModel album = albumRepository.findById(idAlbum)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum não encontrado. idAlbum=" + idAlbum));

        ArtistaModel artista = artistaRepository.findById(request.getIdArtista())
                .orElseThrow(() -> new ResourceNotFoundException("Artista não encontrado. idArtista=" + request.getIdArtista()));

        boolean tituloMudou = request.getTituloAlbum() != null
                && !request.getTituloAlbum().equalsIgnoreCase(album.getTituloAlbum());

        boolean artistaMudou = artista.getIdArtista() != null
                && !artista.getIdArtista().equals(album.getArtista().getIdArtista());

        if (tituloMudou || artistaMudou) {
            if (albumRepository.existsByArtista_IdArtistaAndTituloAlbumIgnoreCase(artista.getIdArtista(), request.getTituloAlbum())) {
                throw new DataIntegrityViolationException("Já existe um álbum com este título para o artista informado.");
            }
        }

        album.setTituloAlbum(request.getTituloAlbum());
//        album.setCapaAlbum(request.getCapaAlbum());
        album.setArtista(artista);

        AlbumModel salvo = albumRepository.save(album);
        enviarAtualizacao("updated", salvo.getIdAlbum());
        return AlbumMapper.toResponseDTO(salvo);
    }

    @Transactional
    public void deletarAlbum(Long idAlbum) {
        if (!albumRepository.existsById(idAlbum)) {
            throw new ResourceNotFoundException("Álbum não encontrado. idAlbum=" + idAlbum);
        }
        albumRepository.deleteById(idAlbum);
        enviarAtualizacao("deleted", idAlbum);
    }

    public Page<AlbumDTO> obterAlbunsPorArtista(Long idArtista, Pageable paginacao) {
        Page<AlbumModel> albuns = albumRepository.findByArtistaIdOrderByTitulo(idArtista, paginacao);
        return albuns.map(this::converterParaDTO);
    }

    public Page<AlbumDTO> listarTodosAlbuns(Pageable paginacao, String direcaoOrdenacao) {
        Sort sort = Sort.by("tituloAlbum");
        sort = "desc".equalsIgnoreCase(direcaoOrdenacao) ? sort.descending() : sort.ascending();
        Pageable pageable = PageRequest.of(paginacao.getPageNumber(), paginacao.getPageSize(), sort);
        Page<AlbumModel> albuns = albumRepository.findAll(pageable);
        return albuns.map(this::converterParaDTO);
    }

    @Transactional(readOnly = true)
    public List<AlbumDTO> listarTodosAlbunsNovo() {
        return albumRepository.findAll(Sort.by("tituloAlbum").ascending())
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    public List<AlbumDTO> obterTodosAlbunsPorArtista(Long idArtista, String direcaoOrdenacao) {
        List<AlbumModel> albuns;
        if ("desc".equalsIgnoreCase(direcaoOrdenacao)) {
            albuns = albumRepository.findByArtistaIdOrderByTituloDesc(idArtista);
        } else {
            albuns = albumRepository.findByArtistaIdOrderByTituloAsc(idArtista);
        }
        return albuns.stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }


    public void excluirAlbum(Long id) {
        AlbumModel albumModel = albumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum não encontrado com id: " + id));

        // Delete cover image from MinIO if exists
        if (albumModel.getCapas() != null) {
            albumModel.getCapas().forEach((capa) -> {
                if (capa.getChaveObjeto() == null) return;
                try {
                    minioService.deleteFile(capa.getChaveObjeto());
                } catch (Exception e) {
                    // Log error but don't fail the operation
                    System.err.println("Failed to delete cover image: " + e.getMessage());
                }
            });
        }

        albumRepository.delete(albumModel);
        enviarAtualizacao("deleted", id);
    }

    public AlbumDTO fazerUploadImagemCapa(Long idAlbum, byte[] dadosImagem, String nomeArquivo, String tipoConteudo) {
        return salvarCapas(idAlbum, List.of(new UploadCapa(nomeArquivo, dadosImagem, tipoConteudo)), true);
    }

    public AlbumDTO attImagemCapa(Long idAlbum, byte[] dadosImagem, String nomeArquivo, String tipoConteudo) {
        return salvarCapas(idAlbum, List.of(new UploadCapa(nomeArquivo, dadosImagem, tipoConteudo)), true);
    }

    @Transactional
    public void definirCapaPrincipal(Long idAlbum, Long idCapa) {
        AlbumModel albumModel = albumRepository.findById(idAlbum)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum não encontrado com id: " + idAlbum));

        List<AlbumCapaModel> capas = albumModel.getCapas();
        if (capas == null || capas.isEmpty()) {
            throw new ResourceNotFoundException("Nenhuma capa encontrada para o álbum: " + idAlbum);
        }

        AlbumCapaModel alvo = null;
        for (AlbumCapaModel capa : capas) {
            if (capa.getIdCapa() != null && capa.getIdCapa().equals(idCapa)) {
                alvo = capa;
            }
            capa.setPrincipal(false);
        }

        if (alvo == null) {
            throw new ResourceNotFoundException("Capa não encontrada para o álbum: " + idAlbum);
        }

        alvo.setPrincipal(true);
        albumRepository.save(albumModel);
        enviarAtualizacao("cover-principal-updated", idAlbum);
    }

    public AlbumDTO adicionarCapas(Long idAlbum, List<UploadCapa> arquivos) {
        return salvarCapas(idAlbum, arquivos, false);
    }

    private AlbumDTO salvarCapas(Long idAlbum, List<UploadCapa> arquivos, boolean substituir) {
        AlbumModel albumModel = albumRepository.findById(idAlbum)
                .orElseThrow(() -> new ResourceNotFoundException("Álbum não encontrado com id: " + idAlbum));

        try {
            if (substituir && albumModel.getCapas() != null) {
                albumModel.getCapas().forEach((capa) -> {
                    if (capa.getChaveObjeto() == null) return;
                    try {
                        minioService.deleteFile(capa.getChaveObjeto());
                    } catch (Exception e) {
                        System.err.println("Failed to delete cover image: " + e.getMessage());
                    }
                });
                albumModel.getCapas().clear();
            }

            for (UploadCapa arquivo : arquivos) {
                String chaveObjeto = "album-covers/" + idAlbum + "/" + arquivo.nomeArquivo();
                minioService.uploadFile(chaveObjeto, arquivo.dadosImagem(), arquivo.tipoConteudo());
                AlbumCapaModel capa = new AlbumCapaModel(albumModel, chaveObjeto);
                if (albumModel.getCapas().isEmpty()) {
                    capa.setPrincipal(true);
                }
                albumModel.getCapas().add(capa);
            }

            AlbumModel salvo = albumRepository.save(albumModel);
            enviarAtualizacao("cover-updated", idAlbum);

            return converterParaDTO(salvo);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload cover image", e);
        }
    }

    public record UploadCapa(String nomeArquivo, byte[] dadosImagem, String tipoConteudo) {}

    private void enviarAtualizacao(String acao, Long idAlbum) {
        messagingTemplate.convertAndSend("/topic/updates", new UpdateMessage("album", acao, idAlbum));
    }

    private AlbumDTO converterParaDTO(AlbumModel album) {
        AlbumDTO dto = new AlbumDTO();

        dto.setId(album.getIdAlbum());
        dto.setTitulo(album.getTituloAlbum());
        dto.setIdArtista(album.getArtista().getIdArtista());
        dto.setNomeArtista(album.getArtista().getNomeArtista());
        dto.setDataCriacao(album.getDataCriacao());
        dto.setDataAtualizacao(album.getDataAtualizacao());

        String capaPrincipal = null;
        if (album.getCapas() != null && !album.getCapas().isEmpty()) {
            AlbumCapaModel principal = album.getCapas().stream()
                    .filter(AlbumCapaModel::isPrincipal)
                    .findFirst()
                    .orElse(album.getCapas().get(0));
            capaPrincipal = principal.getChaveObjeto();
        }
        if (capaPrincipal != null && !capaPrincipal.isBlank()) {
            String basePath = "/v1/albums/" + album.getIdAlbum();
            dto.setUrlImagemCapa(basePath + "/capa");
            try {
                dto.setUrlImagemCapaAssinada(
                        minioService.generatePresignedUrl30Min(capaPrincipal)
                );
            } catch (Exception e) {
                dto.setUrlImagemCapaAssinada(basePath + "/capa/url");
            }
        }

        return dto;
    }
}
