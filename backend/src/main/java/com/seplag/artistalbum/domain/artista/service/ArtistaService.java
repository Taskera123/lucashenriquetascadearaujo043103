package com.seplag.artistalbum.domain.artista.service;

import com.seplag.artistalbum.domain.album.dto.AlbumDTO;
import com.seplag.artistalbum.domain.album.model.AlbumModel;
import com.seplag.artistalbum.domain.album.repository.AlbumRepository;
import com.seplag.artistalbum.domain.artista.dto.ArtistaDTO;
import com.seplag.artistalbum.domain.artista.dto.ArtistaRequestDTO;
import com.seplag.artistalbum.domain.artista.dto.ArtistaResponseDTO;
import com.seplag.artistalbum.domain.artista.mapper.ArtistaMapper;
import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import com.seplag.artistalbum.domain.artista.repository.ArtistaRepository;
import com.seplag.artistalbum.domain.banda.dto.BandaResumoDTO;
import com.seplag.artistalbum.domain.banda.model.BandaArtistaModel;
import com.seplag.artistalbum.domain.banda.repository.BandaArtistaRepository;
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

import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class ArtistaService {

    private final ArtistaRepository artistaRepository;
    private final AlbumRepository albumRepository;
    private final BandaArtistaRepository bandaArtistaRepository;
    private final MinioService minioService;
    private final SimpMessagingTemplate messagingTemplate;

    public ArtistaService(ArtistaRepository artistaRepository,
                          AlbumRepository albumRepository,
                          BandaArtistaRepository bandaArtistaRepository,
                          MinioService minioService,
                          SimpMessagingTemplate messagingTemplate) {
        this.artistaRepository = artistaRepository;
        this.albumRepository = albumRepository;
        this.bandaArtistaRepository = bandaArtistaRepository;
        this.minioService = minioService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public ArtistaResponseDTO criarArtista(ArtistaRequestDTO request) {
        if (artistaRepository.existsByNomeArtistaIgnoreCase(request.getNomeArtista())) {
            throw new DataIntegrityViolationException("Já existe um artista com este nome.");
        }

        ArtistaModel artista = new ArtistaModel();
        artista.setNomeArtista(request.getNomeArtista());

        ArtistaModel salvo = artistaRepository.save(artista);
        enviarAtualizacao("created", salvo.getIdArtista());
        ArtistaResponseDTO dto = ArtistaMapper.toResponseDTO(salvo);
        preencherUrlFoto(dto, salvo);
        return dto;
    }

    @Transactional(readOnly = true)
    public ArtistaResponseDTO obterArtistaPorId(Long idArtista) {
        ArtistaModel artista = artistaRepository.findById(idArtista)
                .orElseThrow(() -> new ResourceNotFoundException("Artista não encontrado. idArtista=" + idArtista));

        ArtistaResponseDTO dto = ArtistaMapper.toResponseDTO(artista);
        preencherUrlFoto(dto, artista);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<ArtistaResponseDTO> listarTodos() {
        return artistaRepository.findAll(Sort.by("nomeArtista").ascending())
                .stream()
                .map(artista -> {
                    ArtistaResponseDTO dto = ArtistaMapper.toResponseDTO(artista);
                    preencherUrlFoto(dto, artista);
                    return dto;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ArtistaResponseDTO> listarPaginado(int page, int size, String sortDir) {
        Sort sort = Sort.by("nomeArtista");
        sort = "desc".equalsIgnoreCase(sortDir) ? sort.descending() : sort.ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return artistaRepository.findAll(pageable).map(artista -> {
            ArtistaResponseDTO dto = ArtistaMapper.toResponseDTO(artista);
            preencherUrlFoto(dto, artista);
            return dto;
        });
    }

    @Transactional
    public ArtistaResponseDTO atualizarArtista(Long idArtista, ArtistaRequestDTO request) {
        ArtistaModel artista = artistaRepository.findById(idArtista)
                .orElseThrow(() -> new ResourceNotFoundException("Artista não encontrado. idArtista=" + idArtista));

        String novoNome = request.getNomeArtista();

        boolean nomeMudou = novoNome != null && !novoNome.equalsIgnoreCase(artista.getNomeArtista());
        if (nomeMudou && artistaRepository.existsByNomeArtistaIgnoreCase(novoNome)) {
            throw new DataIntegrityViolationException("Já existe um artista com este nome.");
        }

        artista.setNomeArtista(novoNome);
        ArtistaModel salvo = artistaRepository.save(artista);
        enviarAtualizacao("updated", salvo.getIdArtista());

        ArtistaResponseDTO dto = ArtistaMapper.toResponseDTO(salvo);
        preencherUrlFoto(dto, salvo);
        return dto;
    }

    @Transactional
    public ArtistaResponseDTO atualizarFotoArtista(Long idArtista, byte[] dados, String nomeArquivo, String tipoConteudo) {
        ArtistaModel artista = artistaRepository.findById(idArtista)
                .orElseThrow(() -> new ResourceNotFoundException("Artista não encontrado. idArtista=" + idArtista));

        String extensao = "";
        if (nomeArquivo != null && nomeArquivo.contains(".")) {
            extensao = nomeArquivo.substring(nomeArquivo.lastIndexOf('.'));
        }
        String chaveObjeto = "artist-covers/" + idArtista + "/foto" + extensao;

        try {
            if (artista.getFotoArtista() != null && !artista.getFotoArtista().equals(chaveObjeto)) {
                minioService.deleteFile(artista.getFotoArtista());
            }
            minioService.uploadFile(chaveObjeto, dados, tipoConteudo);
        } catch (Exception e) {
            throw new RuntimeException("Falha ao salvar foto do artista.", e);
        }

        artista.setFotoArtista(chaveObjeto);
        artista.setFotoArtistaContentType(tipoConteudo);
        ArtistaModel salvo = artistaRepository.save(artista);
        enviarAtualizacao("updated", salvo.getIdArtista());

        ArtistaResponseDTO dto = ArtistaMapper.toResponseDTO(salvo);
        preencherUrlFoto(dto, salvo);
        return dto;
    }

    @Transactional(readOnly = true)
    public FotoArtista obterFotoArtista(Long idArtista) {
        ArtistaModel artista = artistaRepository.findById(idArtista)
                .orElseThrow(() -> new ResourceNotFoundException("Artista não encontrado. idArtista=" + idArtista));

        String chave = artista.getFotoArtista();
        if (chave == null || chave.isBlank()) {
            throw new ResourceNotFoundException("Foto do artista não encontrada. idArtista=" + idArtista);
        }

        try {
            byte[] dados = minioService.downloadFile(chave);
            String tipoConteudo = artista.getFotoArtistaContentType();
            if (tipoConteudo == null || tipoConteudo.isBlank()) {
                tipoConteudo = "image/jpeg";
                String lower = chave.toLowerCase();
                if (lower.endsWith(".png")) {
                    tipoConteudo = "image/png";
                } else if (lower.endsWith(".gif")) {
                    tipoConteudo = "image/gif";
                }
            }
            return new FotoArtista(dados, tipoConteudo);
        } catch (Exception e) {
            throw new ResourceNotFoundException("Foto do artista não encontrada. idArtista=" + idArtista);
        }
    }

    @Transactional
    public void deletarArtista(Long idArtista) {
        if (!artistaRepository.existsById(idArtista)) {
            throw new ResourceNotFoundException("Artista não encontrado. idArtista=" + idArtista);
        }
        artistaRepository.deleteById(idArtista);
        enviarAtualizacao("deleted", idArtista);
    }

    public Page<ArtistaDTO> pesquisarArtistas(String nome, Pageable paginacao) {
        Page<ArtistaModel> artistas = artistaRepository.findByNomeContainingIgnoreCase(nome, paginacao);
        return artistas.map(this::converterParaDTO);
    }

    private ArtistaDTO converterParaDTO(ArtistaModel artista) {
        List<AlbumDTO> albuns = albumRepository.findByArtista_IdArtistaOrderByTituloAlbumAsc(artista.getIdArtista())
                .stream()
                .map(this::converterAlbumParaDTO)
                .toList();
        List<BandaResumoDTO> bandas = buscarBandasPorArtista(artista.getIdArtista());
        ArtistaDTO dto = new ArtistaDTO(
                artista.getIdArtista(),
                artista.getNomeArtista(),
                albuns,
                albuns.size(),
                artista.getDataCriacao(),
                artista.getDataAtualizacao(),
                bandas
        );
        preencherUrlFoto(dto, artista);
        return dto;
    }

    private List<BandaResumoDTO> buscarBandasPorArtista(Long idArtista) {
        return bandaArtistaRepository.findByArtistaIdWithBanda(idArtista)
                .stream()
                .map(BandaArtistaModel::getBanda)
                .filter(banda -> banda != null)
                .map(banda -> new BandaResumoDTO(banda.getIdBanda(), banda.getNomeBanda()))
                .sorted(Comparator.comparing(BandaResumoDTO::getNomeBanda, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private AlbumDTO converterAlbumParaDTO(AlbumModel album) {
        AlbumDTO dto = new AlbumDTO();
        dto.setId(album.getIdAlbum());
        dto.setTitulo(album.getTituloAlbum());
        dto.setIdArtista(album.getArtista().getIdArtista());
        dto.setNomeArtista(album.getArtista().getNomeArtista());
        dto.setDataCriacao(album.getDataCriacao());
        dto.setDataAtualizacao(album.getDataAtualizacao());
        String capaPrincipal = null;
        if (album.getCapas() != null && !album.getCapas().isEmpty()) {
            capaPrincipal = album.getCapas().get(0).getChaveObjeto();
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

    public Page<ArtistaDTO> obterTodosArtistas(Pageable paginacao, String direcaoOrdenacao) {
        Page<ArtistaModel> artistas;
        if ("desc".equalsIgnoreCase(direcaoOrdenacao)) {
            artistas = artistaRepository.findAllOrderByNomeDesc(paginacao);
        } else {
            artistas = artistaRepository.findAllOrderByNomeAsc(paginacao);
        }

        return artistas.map(this::converterParaDTO);
    }

    public Long qtdAlbumArtista(Long idAritsta){
        return albumRepository.countByArtistaId(idAritsta);

    }

    private void enviarAtualizacao(String acao, Long idArtista) {
        messagingTemplate.convertAndSend("/topic/updates", new UpdateMessage("artista", acao, idArtista));
    }

    private void preencherUrlFoto(ArtistaResponseDTO dto, ArtistaModel artista) {
        dto.setUrlFoto(buildUrlFoto(artista));
    }

    private void preencherUrlFoto(ArtistaDTO dto, ArtistaModel artista) {
        dto.setUrlFoto(buildUrlFoto(artista));
    }

    private String buildUrlFoto(ArtistaModel artista) {
        if (artista.getFotoArtista() == null || artista.getFotoArtista().isBlank()) {
            return null;
        }
        return "/v1/artistas/" + artista.getIdArtista() + "/foto";
    }

    public record FotoArtista(byte[] dados, String tipoConteudo) {}
}
