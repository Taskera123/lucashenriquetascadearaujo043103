package com.seplag.artistalbum.shared.controller;

import com.seplag.artistalbum.shared.dto.CatalogoResponseDTO;
import com.seplag.artistalbum.shared.service.CatalogoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/catalogo")
@Tag(name = "Catálogo", description = "Agrega artistas, álbuns e bandas")
public class CatalogoResource {

    private final CatalogoService catalogoService;

    public CatalogoResource(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping
    @Operation(summary = "Listar catálogo completo")
    public ResponseEntity<CatalogoResponseDTO> listarCatalogo() {
        return ResponseEntity.ok(catalogoService.obterCatalogoCompleto());
    }
}
