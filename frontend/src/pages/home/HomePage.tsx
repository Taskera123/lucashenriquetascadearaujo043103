import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Carousel } from 'primereact/carousel';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';
import { CatalogoService } from '../../services/CatalogoService';
import type { AlbumDTO, ArtistaResponseDTO, BandaResponseDTO, CatalogoResponseDTO } from '../../types/api';
import { theme$, toggleTheme } from '../../state/theme.store';

export default function HomePage() {
  const nav = useNavigate();
  const [catalogo, setCatalogo] = useState<CatalogoResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState(theme$.value);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await CatalogoService.obterCatalogo();
        if (active) setCatalogo(data);
      } catch (err: any) {
        if (active) setError(err?.message ?? 'Erro ao carregar catálogo');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const sub = theme$.subscribe(setTheme);
    return () => sub.unsubscribe();
  }, []);

  const artistas = catalogo?.artistas ?? [];
  const albuns = catalogo?.albuns ?? [];
  const bandas = catalogo?.bandas ?? [];

  const albumPreview = useMemo(() => albuns.slice(0, 6), [albuns]);
  const artistPreview = useMemo(() => artistas.slice(0, 8), [artistas]);
  const bandPreview = useMemo(() => bandas.slice(0, 8), [bandas]);
  const bandMapByArtist = useMemo(() => {
    const map = new Map<number, BandaResponseDTO[]>();
    for (const band of bandas) {
      for (const artist of band.artistas ?? []) {
        if (artist.idArtista == null) continue;
        const list = map.get(artist.idArtista) ?? [];
        list.push(band);
        map.set(artist.idArtista, list);
      }
    }
    return map;
  }, [bandas]);

  function resolveAlbumCover(album: AlbumDTO) {
    return album.urlImagemCapaAssinada?.trim() || album.urlImagemCapa?.trim() || '';
  }

  const pageBg = 'var(--surface-0)';
  const sectionBg = 'var(--surface-0)';
  const cardBg = 'var(--surface-card)';
  const textPrimary = 'var(--text-color)';
  const textSecondary = 'var(--text-color-secondary)';

  const clampTitleStyle = {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden'
  };

  function renderAlbumCard(album: AlbumDTO) {
    const coverUrl = resolveAlbumCover(album);
    const bandNames = album.idArtista ? (bandMapByArtist.get(album.idArtista) ?? []).map((band) => band.nomeBanda ?? '') : [];

    return (
      <Card style={{ height: '100%', width: '100%', background: cardBg, color: textPrimary }}>
        <div style={{ display: 'grid', gap: 10, height: '100%', alignContent: 'start' }}>
          <div style={{ fontWeight: 700, fontSize: 16, ...clampTitleStyle }}>{album.titulo ?? 'Sem título'}</div>
          <div style={{ fontSize: 12, color: textSecondary }}>{album.nomeArtista ?? ''}</div>
          <div
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: 10,
              overflow: 'hidden',
              background: 'var(--surface-100)'
            }}
          >
            {coverUrl ? (
              <img src={coverUrl} alt={album.titulo ?? 'Álbum'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ height: '100%', display: 'grid', placeItems: 'center', opacity: 0.7 }}>
                <i className="pi pi-image" style={{ fontSize: 28 }} />
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: textSecondary, ...clampTitleStyle }}>
            Bandas: {bandNames.length ? bandNames.join(', ') : 'Sem vínculo'}
          </div>
        </div>
      </Card>
    );
  }

  function renderArtistCard(artist: ArtistaResponseDTO) {
    return (
      <Card style={{ height: '100%', width: '100%', background: cardBg, color: textPrimary }}>
        <div style={{ display: 'grid', gap: 10, height: '100%', alignContent: 'start' }}>
          <div style={{ fontWeight: 700, fontSize: 16, ...clampTitleStyle }}>{artist.nomeArtista ?? 'Artista'}</div>
          <div
            style={{
              width: '100%',
              height: 160,
              borderRadius: 10,
              background: 'var(--surface-100)',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <i className="pi pi-user" style={{ fontSize: 32, color: textSecondary }} />
          </div>
          <div style={{ fontSize: 12, color: textSecondary }}>
            Álbuns cadastrados: {artist.quantidadeAlbuns ?? 0}
          </div>
        </div>
      </Card>
    );
  }

  function renderBandCard(band: BandaResponseDTO) {
    return (
      <Card style={{ height: '100%', width: '100%', background: cardBg, color: textPrimary }}>
        <div style={{ display: 'grid', gap: 10, height: '100%', alignContent: 'start' }}>
          <div style={{ fontWeight: 700, fontSize: 16, ...clampTitleStyle }}>{band.nomeBanda ?? 'Banda'}</div>
          <div
            style={{
              width: '100%',
              height: 160,
              borderRadius: 10,
              background: 'var(--surface-100)',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <i className="pi pi-sitemap" style={{ fontSize: 32, color: textSecondary }} />
          </div>
          <div style={{ fontSize: 12, color: textSecondary }}>
            Artistas vinculados: {(band.artistas ?? []).length}
          </div>
        </div>
      </Card>
    );
  }

  const albumCarouselItems = useMemo(() => {
    if (!albuns.length) return [];
    const unique = new Map<number, AlbumDTO>();
    for (const album of albuns) {
      if (album.id != null && !unique.has(album.id)) unique.set(album.id, album);
    }
    return Array.from(unique.values());
  }, [albuns]);
  const carouselCardHeight = 360;

  const responsiveCarouselOptions = [
    { breakpoint: '1200px', numVisible: 3, numScroll: 3 , gap:"10px"},
    { breakpoint: '900px', numVisible: 2, numScroll: 2, gap:"10px" },
    { breakpoint: '600px', numVisible: 1, numScroll: 1, gap:"10px" }
  ];

  return (
    <div style={{ minHeight: '100vh', background: pageBg, padding: '24px 16px', color: textPrimary }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 20 }}>
        <section style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ margin: 0 }}>Catálogo de artistas, álbuns e bandas</h1>
              <p style={{ margin: '8px 0 0', color: textSecondary }}>
                Explore os cadastros públicos e entre na área administrativa apenas quando precisar gerenciar o conteúdo.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%', maxWidth: 420 }}>
              <Button
                icon={theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'}
                label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                outlined
                onClick={toggleTheme}
                style={{ borderColor: textSecondary, color: textPrimary, flex: 1 }}
              />
              <Button
                label="Admin"
                icon="pi pi-sign-in"
                onClick={() => nav('/login')}
                style={{ flex: 1 }}
              />
            </div>
          </div>
          {error ? <Message severity="error" text={error} /> : null}
        </section>

        <section style={{ display: 'grid', gap: 16, background: sectionBg, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0 }}>Álbuns</h2>
            <span style={{ color: textSecondary }}>Total: {albuns.length}</span>
          </div>

          {albumCarouselItems.length ? (
            <Carousel
              value={albumCarouselItems}
              numVisible={4}
              numScroll={4}
              itemTemplate={(album: AlbumDTO) => (
                <div className="p-2" style={{ height: carouselCardHeight, width: '100%', padding: '0 10px'}}>
                  {renderAlbumCard(album)}
                </div>
              )}
              circular={albumCarouselItems.length > 4}
              autoplayInterval={albumCarouselItems.length > 4 ? 5000 : 2000}
              showIndicators={albumCarouselItems.length > 4}
              showNavigators={albumCarouselItems.length > 4}
              style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}
              responsiveOptions={responsiveCarouselOptions}
            />
          ) : loading ? (
            <div style={{ opacity: 0.7 }}>Carregando albuns...</div>
          ) : (
            <div style={{ opacity: 0.7 }}>Nenhum album cadastrado ainda.</div>
          )}

          {/* {loading && !albuns.length ? (
            <div style={{ opacity: 0.7 }}>Carregando álbuns...</div>
          ) : albumPreview.length ? (
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {albumPreview.map((album) => (
                <div key={album.id ?? album.titulo} className="p-1" style={{ minHeight: 360 }}>
                  {renderAlbumCard(album)}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.7 }}>Nenhum álbum cadastrado ainda.</div>
          )} */}
        </section>

        <section style={{ display: 'grid', gap: 16, background: sectionBg, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0 }}>Artistas</h2>
            <span style={{ color: textSecondary }}>Total: {artistas.length}</span>
          </div>

          {artistPreview.length ? (
            <Carousel
              value={artistPreview}
              numVisible={4}
              numScroll={4}
              itemTemplate={(artist: ArtistaResponseDTO) => (
                <div className="p-2" style={{ height: carouselCardHeight, width: '100%', padding: '0 10px'  }}>
                  {renderArtistCard(artist)}
                </div>
              )}
              circular={artistPreview.length > 4}
              autoplayInterval={artistPreview.length > 4 ? 5000 : 2000}
              showIndicators={artistPreview.length > 4}
              showNavigators={artistPreview.length > 4}
              style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}
              responsiveOptions={responsiveCarouselOptions}
            />
          ) : loading ? (
            <div style={{ opacity: 0.7 }}>Carregando artistas...</div>
          ) : (
            <div style={{ opacity: 0.7 }}>Nenhum artista cadastrado ainda.</div>
          )}
        </section>

        <section style={{ display: 'grid', gap: 16, background: sectionBg, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0 }}>Bandas</h2>
            <span style={{ color: textSecondary }}>Total: {bandas.length}</span>
          </div>

          {bandPreview.length ? (
            <Carousel
              value={bandPreview}
              numVisible={4}
              numScroll={4}
              itemTemplate={(band: BandaResponseDTO) => (
                <div className="p-2" style={{ height: carouselCardHeight, width: '100%', padding: '0 10px'  }}>
                  {renderBandCard(band)}
                </div>
              )}
              circular={bandPreview.length > 4}
              autoplayInterval={bandPreview.length > 4 ? 5000 : 2000}
              showIndicators={bandPreview.length > 4}
              showNavigators={bandPreview.length > 4}
              style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}
              responsiveOptions={responsiveCarouselOptions}
            />
          ) : loading ? (
            <div style={{ opacity: 0.7 }}>Carregando bandas...</div>
          ) : (
            <div style={{ opacity: 0.7 }}>Nenhuma banda cadastrada ainda.</div>
          )}
        </section>
      </div>
    </div>
  );
}
