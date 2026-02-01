package com.seplag.artistalbum.domain.regional.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seplag.artistalbum.domain.regional.model.Regional;
import com.seplag.artistalbum.domain.regional.repository.RegionalRepository;
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

    @Scheduled(fixedRate = 3600000) // Run every hour
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
        // Get current active regionals from database
        List<Regional> currentActiveRegionals = regionalRepository.findByAtivoTrue();
        Set<String> currentActiveNames = currentActiveRegionals.stream()
                .map(Regional::getNome)
                .collect(Collectors.toSet());

        // Get external regional names
        Set<String> externalNames = externalRegionals.stream()
                .filter(regional -> regional.containsKey("nome") && regional.get("nome") != null)
                .map(regional -> regional.get("nome").toString())
                .collect(Collectors.toSet());

        // Process each external regional
        for (Map<String, Object> externalRegional : externalRegionals) {
            String nome = externalRegional.get("nome").toString();

            if (nome != null && !nome.trim().isEmpty()) {
                processRegional(nome, currentActiveNames, externalNames);
            }
        }

        // Deactivate regionals not present in external API
        for (Regional currentRegional : currentActiveRegionals) {
            if (!externalNames.contains(currentRegional.getNome())) {
                regionalRepository.deactivateByNome(currentRegional.getNome());
                logger.info("Deactivated regional: {}", currentRegional.getNome());
            }
        }
    }

    private void processRegional(String nome, Set<String> currentActiveNames, Set<String> externalNames) {
        if (currentActiveNames.contains(nome)) {
            // Already exists and active - check if attributes changed
            Regional existing = regionalRepository.findByNomeAndAtivo(nome, true).orElse(null);
            if (existing != null) {
                // For this simple implementation, assume no attribute changes to check
                // In a more complex scenario, we would compare all attributes
                return;
            }
        } else {
            // Check if there's an inactive version with same name
            List<Regional> existingRegionals = regionalRepository.findByNome(nome);
            boolean hasInactive = existingRegionals.stream().anyMatch(r -> !r.getAtivo());

            if (hasInactive) {
                // Deactivate the old one and create new
                regionalRepository.deactivateByNome(nome);
                logger.info("Deactivated old regional and creating new: {}", nome);
            }

            // Create new active regional
            Regional newRegional = new Regional(nome, true);
            regionalRepository.save(newRegional);
            logger.info("Created new regional: {}", nome);
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
}

