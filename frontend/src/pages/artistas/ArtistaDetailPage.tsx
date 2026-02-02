import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ArtistService } from '../../services/ArtistaService';
import { AlbumService } from '../../services/AlbumService';
import { updates$ } from '../../state/wsUpdates.store';
import type { AlbumDTO, ArtistaResponseDTO } from '../../types/api';
import AlbumCoverUploader from '../../components/albums/AlbumCoverUploader';
import ArtistFormDialog from '../../components/artistas/ArtistFormDialog';
import AlbumFormDialog from '../../components/albums/AlbumFormDialog';
import resolveApiUrl from '../../utils/resolveApiUrl';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/albumartistaapi';

function resolveFotoUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function ArtistDetailPage() {
  const { id } = useParams();
  const artistId = useMemo(() => Number(id), [id]);
  const nav = useNavigate();

  const [artist, setArtist] = useState<ArtistaResponseDTO | null>(null);
  const [albums, setAlbums] = useState<AlbumDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverUrlByAlbumId, setCoverUrlByAlbumId] = useState<Record<number, string>>({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [albumDialogVisible, setAlbumDialogVisible] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: a } = await ArtistService.obterPorId(artistId);
      setArtist(a);
      const { data: page } = await AlbumService.listarPorArtistaPaginado(artistId, { pagina: 0, tamanho: 50 });
      setAlbums(page.content ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const sub = updates$.subscribe((event) => {
      if (event.entity === 'artista' && (!event.id || event.id === artistId)) {
        load();
      }
      if (event.entity === 'album') {
        load();
      }
    });
    return () => sub.unsubscribe();
  }, [artistId, load]);

  async function ensureCoverUrl(albumId?: number, signed?: string | null) {
    if (!albumId) return;
    if (signed && signed.trim()) return;
    if (coverUrlByAlbumId[albumId]) return;
    try {
      const { data } = await AlbumService.obterUrlCapa(albumId);
      if (typeof data === 'string' && data.trim()) setCoverUrlByAlbumId((p) => ({ ...p, [albumId]: data }));
    } catch {}
  }

  function resolveCoverUrl(a: AlbumDTO) {
    // if (a.urlImagemCapaAssinada?.trim()) return a.urlImagemCapaAssinada;
    const signed = a.urlImagemCapaAssinada?.trim();
    if (signed && signed.startsWith('http')) return signed;
    if (a.urlImagemCapa?.trim()) return resolveApiUrl(a.urlImagemCapa.trim());
    if (signed) return resolveApiUrl(signed);
    if (a.id && coverUrlByAlbumId[a.id]) return coverUrlByAlbumId[a.id];
    return null;
  }

  function itemTemplate(a: AlbumDTO) {
    const coverUrl = resolveCoverUrl(a);
    if (a.id) ensureCoverUrl(a.id, a.urlImagemCapaAssinada ?? null);

    return (
      <div className="p-2">
        <Card title={a.titulo ?? 'Sem título'} subTitle={a.nomeArtista ?? artist?.nomeArtista ?? ''}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 8, overflow: 'hidden', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {coverUrl ? (
                <img src={coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ opacity: 0.7, textAlign: 'center' }}>
                  <i className="pi pi-image" style={{ fontSize: 28 }} />
                  <div style={{ fontSize: 12, marginTop: 8 }}>Sem capa</div>
                </div>
              )}
            </div>

            {a.id ? (
              <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                {a.id ? (
  <div className="flex gap-2" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
    <Button
      label="Ver detalhes"
      icon="pi pi-eye"
      className="app-button-primary"
      onClick={() => nav(`/admin/albums/${a.id}`)}
    />

    <Button
      label="Editar"
      icon="pi pi-pencil"
      className="app-button-secondary"
      onClick={() => nav(`/admin/albums/${a.id}/edit`)}
    />

    <AlbumCoverUploader
      mode="update"
      albumId={a.id}
      buttonLabel="Trocar capa"
      onUploaded={async () => {
        await ensureCoverUrl(a.id!, null);
      }}
    />
  </div>
) : null}
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex gap-2 items-center mb-3" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
  <div className="flex gap-2 items-center">
    <Button icon="pi pi-arrow-left" text onClick={() => nav('/admin/artistas')} />
    <div style={{ fontSize: 18, fontWeight: 700 }}>{artist?.nomeArtista ?? 'Artista'}</div>
  </div>

  <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
    <Button
      label="Gerenciar álbuns"
      icon="pi pi-images"
      className="app-button-secondary"
      onClick={() => nav(`/admin/artistas/${artistId}/albums`)}
    />
    <Button
      label="Novo álbum"
      icon="pi pi-plus"
      className="app-button-primary"
      onClick={() => setAlbumDialogVisible(true)}
    />
    <Button
      label="Editar"
      icon="pi pi-pencil"
      className="app-button-secondary"
      onClick={() => setDialogVisible(true)}
    />
  </div>
</div>
{error ? <div className="p-error mb-2">{error}</div> : null}

      <div className="flex gap-3 items-center mb-3" style={{ flexWrap: 'wrap' }}>
        {artist?.urlFoto ? (
          <div style={{ width: 160, height: 160, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
            <img src={artist.urlFoto} alt={artist.nomeArtista ?? 'Artista'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{ width: 160, height: 160, borderRadius: 8, border: '1px dashed rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
            <div style={{ textAlign: 'center', fontSize: 12 }}>
              <i className="pi pi-user" style={{ fontSize: 24 }} />
              <div>Sem foto</div>
            </div>
          </div>
        )}
        {loading ? <div style={{ fontSize: 12, opacity: 0.7 }}>Carregando artista...</div> : null}
      </div>

      <ArtistFormDialog
        visible={dialogVisible}
        mode="edit"
        artistId={artistId}
        onHide={() => setDialogVisible(false)}
        onSaved={async () => {
          await load();
        }}
      />

      {error ? <div className="p-error mb-2">{error}</div> : null}

      <div className="flex gap-3 items-center mb-3" style={{ flexWrap: 'wrap' }}>
        {resolveFotoUrl(artist?.urlFoto) ? (
          <div style={{ width: 160, height: 160, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
            <img src={resolveFotoUrl(artist?.urlFoto) ?? ''} alt={artist?.nomeArtista ?? 'Artista'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{ width: 160, height: 160, borderRadius: 8, border: '1px dashed rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
            <div style={{ textAlign: 'center', fontSize: 12 }}>
              <i className="pi pi-user" style={{ fontSize: 24 }} />
              <div>Sem foto</div>
            </div>
          </div>
        )}
        {loading ? <div style={{ fontSize: 12, opacity: 0.7 }}>Carregando artista...</div> : null}
      </div>

      <ArtistFormDialog
        visible={dialogVisible}
        mode="edit"
        artistId={artistId}
        onHide={() => setDialogVisible(false)}
        onSaved={async () => {
          await load();
        }}
      />

      <AlbumFormDialog
        visible={albumDialogVisible}
        mode="create"
        artistId={artistId}
        onHide={() => setAlbumDialogVisible(false)}
        onSaved={async () => {
          await load();
        }}
      />

      {error ? <div className="p-error mb-2">{error}</div> : null}

      <div className="flex gap-3 items-center mb-3" style={{ flexWrap: 'wrap' }}>
        {resolveFotoUrl(artist?.urlFoto) ? (
          <div style={{ width: 160, height: 160, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
            <img src={resolveFotoUrl(artist?.urlFoto) ?? ''} alt={artist?.nomeArtista ?? 'Artista'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{ width: 160, height: 160, borderRadius: 8, border: '1px dashed rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
            <div style={{ textAlign: 'center', fontSize: 12 }}>
              <i className="pi pi-user" style={{ fontSize: 24 }} />
              <div>Sem foto</div>
            </div>
          </div>
        )}
        {loading ? <div style={{ fontSize: 12, opacity: 0.7 }}>Carregando artista...</div> : null}
      </div>

      <ArtistFormDialog
        visible={dialogVisible}
        mode="edit"
        artistId={artistId}
        onHide={() => setDialogVisible(false)}
        onSaved={async () => {
          await load();
        }}
      />

      <AlbumFormDialog
        visible={albumDialogVisible}
        mode="create"
        artistId={artistId}
        onHide={() => setAlbumDialogVisible(false)}
        onSaved={async () => {
          await load();
        }}
      />

    </div>
  );
}
