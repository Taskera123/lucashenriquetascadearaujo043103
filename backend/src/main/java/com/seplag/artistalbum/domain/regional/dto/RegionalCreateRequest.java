package com.seplag.artistalbum.domain.regional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegionalCreateRequest(
        @NotBlank(message = "Nome da regional é necessario")
        @Size(max = 200)
        String nome,
        Boolean ativo,
        Integer codigoExterno
) {}
