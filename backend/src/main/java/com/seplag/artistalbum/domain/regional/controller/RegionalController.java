package com.seplag.artistalbum.domain.regional.controller;

import com.seplag.artistalbum.domain.regional.model.Regional;
import com.seplag.artistalbum.domain.regional.service.RegionalSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
