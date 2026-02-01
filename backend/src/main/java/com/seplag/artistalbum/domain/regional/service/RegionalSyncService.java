package com.seplag.artistalbum.domain.regional.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seplag.artistalbum.domain.regional.dto.RegionalCreateRequest;
import com.seplag.artistalbum.domain.regional.dto.RegionalUpdateRequest;
import com.seplag.artistalbum.domain.regional.model.Regional;
import com.seplag.artistalbum.domain.regional.repository.RegionalRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RegionalSyncService {

    private static final Logger logger = LoggerFactory.getLogger(RegionalSyncService.class);

    private final WebClient webClient;
    private final RegionalRepository regionalRepository;
    private final ObjectMapper objectMapper;

    @Value("${external.api.police-regionals}")
    private String policeRegionalsUrl;

    public RegionalSyncService(WebClient.Builder webClientBuilder,
                              RegionalRepository regionalRepository,
                              ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.regionalRepository = regionalRepository;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedRate = 3600000)
    public void syncRegionals() {
        logger.info("Starting regional synchronization with Police API");

        try {
            List<Map<String, Object>> externalRegionals = fetchExternalRegionals();

            if (externalRegionals != null && !externalRegionals.isEmpty()) {
                syncRegionalsData(externalRegionals);
                logger.info("Regional synchronization completed successfully");
            } else {
                logger.warn("No regionals data received from external API");
            }
        } catch (Exception e) {
            logger.error("Error during regional synchronization", e);
        }
    }

    @Transactional
    public void syncRegionalsData(List<Map<String, Object>> externalRegionals) {

        List<ExternalRegional> parsedRegionals = externalRegionals.stream()
                .map(this::toExternalRegional)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<Regional> currentActiveRegionals = regionalRepository.findByAtivoTrue();
        Set<Integer> externalCodes = parsedRegionals.stream()
                .map(ExternalRegional::codigoExterno)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Get external regional names
        Set<String> externalNames = parsedRegionals.stream()
                .map(ExternalRegional::nome)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Integer, Regional> activeByCodigo = currentActiveRegionals.stream()
                .filter(regional -> regional.getCodigoExterno() != null)
                .collect(Collectors.toMap(Regional::getCodigoExterno, regional -> regional, (first, ignored) -> first));
        Map<String, Regional> activeByNome = currentActiveRegionals.stream()
                .collect(Collectors.toMap(Regional::getNome, regional -> regional, (first, ignored) -> first));

        for (ExternalRegional externalRegional : parsedRegionals) {
            Regional existing = externalRegional.codigoExterno() != null
                    ? activeByCodigo.get(externalRegional.codigoExterno())
                    : activeByNome.get(externalRegional.nome());

            if (existing == null) {
                saveNewRegional(externalRegional);
                continue;
            }

            if (!existing.getNome().equals(externalRegional.nome())) {
                deactivateRegional(existing);
                saveNewRegional(externalRegional);
            }
        }

        // Deactivate regionals not present in external API
        for (Regional currentRegional : currentActiveRegionals) {
            Integer codigoExterno = currentRegional.getCodigoExterno();
            if (codigoExterno != null) {
                if (!externalCodes.contains(codigoExterno)) {
                    regionalRepository.deactivateByCodigoExterno(codigoExterno);
                    logger.info("Deactivated regional: {}", currentRegional.getNome());
                }
            } else if (!externalNames.contains(currentRegional.getNome())) {
                regionalRepository.deactivateByNome(currentRegional.getNome());
                logger.info("Deactivated regional: {}", currentRegional.getNome());
            }
        }
    }

    private ExternalRegional toExternalRegional(Map<String, Object> externalRegional) {
        if (externalRegional == null || !externalRegional.containsKey("nome")) {
            return null;
        }

        String nome = Objects.toString(externalRegional.get("nome"), "").trim();
        if (nome.isEmpty()) {
            return null;
        }

        Integer codigoExterno = null;
        Object codigoRaw = externalRegional.get("id");
        if (codigoRaw instanceof Number) {
            codigoExterno = ((Number) codigoRaw).intValue();
        } else if (codigoRaw != null) {
            try {
                codigoExterno = Integer.valueOf(codigoRaw.toString());
            } catch (NumberFormatException ignored) {
                logger.warn("Invalid regional id received from external API: {}", codigoRaw);
            }
        }

        return new ExternalRegional(codigoExterno, nome);
    }

    private void saveNewRegional(ExternalRegional externalRegional) {
        Regional newRegional = new Regional(externalRegional.nome(), true);
        newRegional.setCodigoExterno(externalRegional.codigoExterno());
        regionalRepository.save(newRegional);
        logger.info("Created new regional: {}", externalRegional.nome());
    }

    private void deactivateRegional(Regional existing) {
        if (existing.getCodigoExterno() != null) {
            regionalRepository.deactivateByCodigoExterno(existing.getCodigoExterno());
            logger.info("Deactivated old regional with external code: {}", existing.getCodigoExterno());
        } else {
            regionalRepository.deactivateByNome(existing.getNome());
            logger.info("Deactivated old regional: {}", existing.getNome());
        }
    }

    private List<Map<String, Object>> fetchExternalRegionals() {
        try {
            Mono<String> response = webClient.get()
                    .uri(policeRegionalsUrl)
                    .retrieve()
                    .bodyToMono(String.class);

            String jsonResponse = response.block();
            return objectMapper.readValue(jsonResponse, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            logger.error("Error fetching regionals from external API", e);
            return null;
        }
    }

    public List<Regional> getActiveRegionals() {
        return regionalRepository.findActiveOrderByNome();
    }
    private record ExternalRegional(Integer codigoExterno, String nome) {}

    @Transactional
    public Regional createRegional(RegionalCreateRequest request) {
        Boolean ativo = request.ativo() != null ? request.ativo() : true;
        Regional regional = new Regional(request.nome(), ativo);
        regional.setCodigoExterno(request.codigoExterno());
        return regionalRepository.save(regional);
    }
    @Transactional
    public Regional updateRegional(Long id, RegionalUpdateRequest request) {
        Regional existing = regionalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Regional not found"));

        String nomeAtualizado = request.nome();
        boolean nomeAlterado = nomeAtualizado != null
                && !nomeAtualizado.isBlank()
                && !nomeAtualizado.equals(existing.getNome());

        if (nomeAlterado) {
            existing.setAtivo(false);
            regionalRepository.save(existing);

            Regional novoRegistro = new Regional(nomeAtualizado, request.ativo());
            novoRegistro.setCodigoExterno(existing.getCodigoExterno());
            return regionalRepository.save(novoRegistro);
        }

        existing.setAtivo(request.ativo());
        return regionalRepository.save(existing);
    }
}

