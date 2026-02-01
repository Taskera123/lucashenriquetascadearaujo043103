package com.seplag.artistalbum.domain.regional.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegionalUpdateRequest(
        @Size(max = 200)
        String nome,
        @NotNull(message = "Status ATIVO/INATIVO é necessario")
        Boolean ativo
) {}
