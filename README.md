# Projeto Artist Album (SEPLAG/MT 2026)

Projeto prático para o processo seletivo da SEPLAG/MT 2026, com backend em Spring Boot e frontend em React.

## Dados de inscrição

| Nome completo | **LUCAS HENRIQUE TASCA DE ARAUJO** |
| E-mail | **tascalucas6@gmail.com** |
| Inscrição | **16425** |
| Vaga | **Full Stack** |

## Commits gerados por Lucas Henrique Tasca de Araujo - Taskera123 

## Visão geral

- **Backend**: API REST com autenticação JWT, banco PostgreSQL, storage MinIO, WebSocket e documentação OpenAPI.
- **Frontend**: SPA em React (Vite) + tailwind com framework reactprime para área pública e administrativa.

## Arquitetura modular

O backend é organizado por **domínios** (artista, álbum, banda, regional, auth), cada um contendo camadas de **controller**, **service**, **repository**, **dto** e **model**. Essa separação favorece:

- **Manutenibilidade**: mudanças em um domínio não impactam os demais.
- **Escalabilidade**: facilita adicionar novas funcionalidades sem acoplamento.
- **Testabilidade**: serviços e repositórios podem ser testados isoladamente.
- **Clareza**: fluxo de dados explícito entre entrada (DTO) → regra de negócio (Service) → persistência (Repository).

No frontend, a organização é por **páginas**, **componentes** e **serviços**, mantendo o consumo de APIs centralizado e facilitando a evolução da UI.

## Modelo de dados (PostgreSQL)

As migrações Flyway definem o esquema inicial. Principais tabelas e relações:

### Tabelas principais

- **artista**: armazena o cadastro de artistas.
- **album**: armazena os álbuns e referencia um artista (`album.idArtista`).
- **albumCapa**: armazena capas dos álbuns, com indicação de capa principal e chave do objeto no MinIO.
- **banda**: cadastro de bandas.
- **bandaArtista**: tabela de relacionamento N:N entre banda e artista.
- **regional**: cadastro de regionais (sincronizadas com API externa).

### Relações

- **Artista 1:N Álbum**: um artista possui vários álbuns.
- **Álbum 1:N AlbumCapa**: um álbum pode ter múltiplas capas (com uma principal).
- **Banda N:N Artista**: uma banda pode ter vários artistas e vice‑versa (via `bandaArtista`).

## Stack principal

**Backend**
- Java + Spring Boot 3.2
- Spring Data JPA + PostgreSQL
- Spring Security + JWT
- Flyway (migrations)
- MinIO (armazenamento de capas)
- WebSocket (STOMP)

**Frontend**
- React 19 + Vite
- PrimeReact/PrimeFlex + Tailwind
- Axios + RxJS

## Como executar (Docker Compose)

> Este projeto utiliza **Docker** para levantar a aplicação completa (backend, frontend, banco e MinIO).

1. **(Recomendado)** Limpe o cache/volumes do Docker antes de subir, para evitar conflitos de banco/porta:

```bash
docker compose down -v --remove-orphans
docker volume prune -f
docker builder prune -f
```

2. Suba os serviços:

```bash
docker compose up --build
```

3. Acesse:

- **Frontend**: http://localhost:8081
- **Backend**: http://localhost:8080/albumartistaapi
- **Swagger UI**: http://localhost:8080/albumartistaapi/swagger-ui/index.html
- **Health check**: http://localhost:8080/albumartistaapi/actuator/health
- **MinIO Console**: http://localhost:9001

## Credenciais

### Frontend (login administrativo)

- **Usuário**: `admin`
- **Senha**: `admin123`

> O backend também possui o usuário `user` com senha `user123` (perfil básico).

### Banco de dados (PostgreSQL)

- **Host**: `localhost`
- **Porta**: `5432`
- **Database**: `artist_album_db`
- **Usuário**: `artist_user`
- **Senha**: `artist_pass`

### MinIO

- **Endpoint**: http://localhost:9000
- **Access Key**: `admin123`
- **Secret Key**: `admin123`
- **Bucket**: `artist-album-covers`

### JWT

- **Secret**: `31031994lucashenriquetascadearaujo04310316140`
- **Expiração**: `300000` (ms)

## Endpoints da API

> Base URL: `http://localhost:8080/albumartistaapi`

### Autenticação
- `POST /auth/login`
- `POST /auth/refresh`

### Root
- `GET /`

### Artistas
- `POST /v1/artistas`
- `GET /v1/artistas`
- `GET /v1/artistas/{idArtista}`
- `PUT /v1/artistas/{idArtista}`
- `DELETE /v1/artistas/{idArtista}`
- `GET /v1/artistas/paginado`
- `GET /v1/artistas/pesquisa`
- `GET /v1/artistas/all`
- `PUT /v1/artistas/{idArtista}/foto` (multipart)
- `GET /v1/artistas/{idArtista}/foto`

### Álbuns
- `POST /v1/albums`
- `GET /v1/albums/{idAlbum}`
- `PUT /v1/albums/{idAlbum}`
- `DELETE /v1/albums/{idAlbum}`
- `POST /v1/albums/{id}/capa` (multipart)
- `POST /v1/albums/{id}/capas` (multipart)
- `PUT /v1/albums/{id}/capa` (multipart)
- `GET /v1/albums/capa/{idAlbum}`
- `GET /v1/albums/{id}/capas/{idCapa}/arquivo`
- `GET /v1/albums/{id}/capas`
- `PUT /v1/albums/{id}/capas/{idCapa}/principal`
- `GET /v1/albums/artista/{idArtista}`
- `GET /v1/albums/all`
- `GET /v1/albums/artista/{idArtista}/todos`
- `GET /v1/albums/{id}/capa/url`

### Bandas
- `POST /v1/bandas`
- `GET /v1/bandas`
- `GET /v1/bandas/{idBanda}`
- `PUT /v1/bandas/{idBanda}`
- `DELETE /v1/bandas/{idBanda}`
- `GET /v1/bandas/paginado`
- `POST /v1/bandas/{idBanda}/artistas`
- `DELETE /v1/bandas/{idBanda}/artistas/{idArtista}`
- `GET /v1/bandas/{idBanda}/artistas`

### Regionais
- `GET /v1/regionals`
- `POST /v1/regionals/sync`
- `POST /v1/regionals`
- `PUT /v1/regionals/{id}`

### Catálogo
- `GET /v1/catalogo`

### WebSocket (STOMP)
- **Handshake**: `/ws`
- **Enviar**: `/app/ping`
- **Receber**: `/topic/artist-updates`

