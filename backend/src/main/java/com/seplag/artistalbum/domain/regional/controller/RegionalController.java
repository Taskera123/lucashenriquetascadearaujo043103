package com.seplag.artistalbum.domain.regional.controller;

import com.seplag.artistalbum.domain.regional.dto.RegionalCreateRequest;
import com.seplag.artistalbum.domain.regional.dto.RegionalUpdateRequest;
import com.seplag.artistalbum.domain.regional.model.Regional;
import com.seplag.artistalbum.domain.regional.service.RegionalSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/regionals")
@Tag(name = "Regionais", description = "APIs de gerenciamento das regionais da polícia")
public class RegionalController {

    private final RegionalSyncService regionalSyncService;

    public RegionalController(RegionalSyncService regionalSyncService) {
        this.regionalSyncService = regionalSyncService;
    }

    @GetMapping
    @Operation(summary = "Obter todas as regionais ativas")
    public ResponseEntity<List<Regional>> getActiveRegionals() {
        List<Regional> regionals = regionalSyncService.getActiveRegionals();
        return ResponseEntity.ok(regionals);
    }

    @PostMapping("/sync")
    @Operation(summary = "Disparar sincronização manual das regionais")
    public ResponseEntity<String> syncRegionals() {
        regionalSyncService.syncRegionals();
        return ResponseEntity.ok("Sincronização das regionais concluída");
    }

    @PostMapping
    @Operation(summary = "Criar uma nova regional")
    public ResponseEntity<Regional> createRegional(@Valid @RequestBody RegionalCreateRequest request) {
        Regional regional = regionalSyncService.createRegional(request);
        return ResponseEntity.ok(regional);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar estado ativo e tratar alteração de atributos")
    public ResponseEntity<Regional> updateRegional(@PathVariable Long id, @Valid @RequestBody RegionalUpdateRequest request) {
        Regional regional = regionalSyncService.updateRegional(id, request);
        return ResponseEntity.ok(regional);
    }
}
