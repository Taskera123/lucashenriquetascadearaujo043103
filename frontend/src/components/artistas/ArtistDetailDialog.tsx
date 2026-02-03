import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { ArtistService } from '../../services/ArtistaService';
import { AlbumService } from '../../services/AlbumService';
import type { AlbumDTO, ArtistaResponseDTO } from '../../types/api';
import AlbumFormDialog from '../../components/albums/AlbumFormDialog';
import ArtistFormDialog from '../../components/artistas/ArtistFormDialog';
import resolveApiUrl from '../../utils/resolveApiUrl';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/albumartistaapi';

function resolveFotoUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

type Props = {
  visible: boolean;
  artistId: number | null;
  onHide: () => void;
};

export default function ArtistDetailDialog({ visible, artistId, onHide }: Props) {
  const [artist, setArtist] = useState<ArtistaResponseDTO | null>(null);
  const [albums, setAlbums] = useState<AlbumDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [coverUrlByAlbumId, setCoverUrlByAlbumId] = useState<Record<number, string>>({});
  const [editVisible, setEditVisible] = useState(false);
  const [albumCreateVisible, setAlbumCreateVisible] = useState(false);
  const [albumEditId, setAlbumEditId] = useState<number | null>(null);

  const resolvedArtistId = useMemo(() => (artistId ? Number(artistId) : null), [artistId]);

  const load = useCallback(async () => {
    if (!resolvedArtistId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: a } = await ArtistService.obterPorId(resolvedArtistId);
      setArtist(a);
      const { data: page } = await AlbumService.listarPorArtistaPaginado(resolvedArtistId, { pagina: 0, tamanho: 50 });
      setAlbums(page.content ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [resolvedArtistId]);

  useEffect(() => {
    if (!visible) return;
    load();
  }, [visible, load]);

  // async function ensureCoverUrl(albumId?: number, signed?: string | null) {
  //   if (!albumId) return;
  //   // if (signed && signed.trim()) return;
  //   if (signed && signed.trim().startsWith('http')) return;
  //   if (coverUrlByAlbumId[albumId]) return;
  //   try {
  //     const { data } = await AlbumService.obterUrlCapa(albumId);
  //     if (typeof data === 'string' && data.trim()) setCoverUrlByAlbumId((p) => ({ ...p, [albumId]: data }));
  //   } catch {}
  // }

  function resolveCoverUrl(a: AlbumDTO) {
    // if (a.urlImagemCapaAssinada?.trim()) return a.urlImagemCapaAssinada;
    const signed = a.urlImagemCapaAssinada?.trim();
    if (signed && signed.startsWith('http')) return signed;
    if (a.urlImagemCapa?.trim()) return resolveApiUrl(a.urlImagemCapa.trim());
    if (signed) return resolveApiUrl(signed);
    // if (a.id && coverUrlByAlbumId[a.id]) return coverUrlByAlbumId[a.id];
    return null;
  }

  function renderAlbum(a: AlbumDTO) {
    const coverUrl = resolveCoverUrl(a);
    // if (a.id) ensureCoverUrl(a.id, a.urlImagemCapaAssinada ?? null);
    return (
      <div className="p-2" key={a.id ?? a.titulo}>
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
            <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
              {a.id ? (
                <Button
                  label="Editar álbum"
                  icon="pi pi-pencil"
                  className="app-button-secondary"
                  onClick={() => setAlbumEditId(a.id!)}
                />
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const dialogHeader = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <span style={{ fontSize: 22, fontWeight: 700 }}>
      {artist?.nomeArtista ?? 'Artista'}
    </span>
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      {resolveFotoUrl(artist?.urlFoto) ? (
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.08)',
            flexShrink: 0
          }}
        >
          <img
            src={resolveFotoUrl(artist?.urlFoto)!}
            alt={artist?.nomeArtista ?? 'Artista'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 8,
            border: '1px dashed rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7,
            flexShrink: 0
          }}
        >
          <i className="pi pi-user" style={{ fontSize: 28 }} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button
          label="Editar artista"
          icon="pi pi-pencil"
          className="app-button-secondary"
          onClick={() => setEditVisible(true)}
        />
        <Button
          label="Novo álbum"
          icon="pi pi-plus"
          className="app-button-primary"
          onClick={() => setAlbumCreateVisible(true)}
        />
      </div>
    </div>
  </div>
  );

  return (
    <Dialog
      header={dialogHeader}
      visible={visible}
      onHide={onHide}
      // style={{ width: 'min(900px, 95vw)' }}
      className="app-dialog"
      modal
    >
      {error ? <Message severity="error" text={error} className="mb-3" /> : null}
      

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <span style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Álbuns do artista</span>
        {(albums ?? []).map(renderAlbum)}
        {!albums.length && !loading ? <div style={{ opacity: 0.7 }}>Nenhum álbum encontrado.</div> : null}
      </div>

      <ArtistFormDialog
        visible={editVisible}
        mode="edit"
        artistId={resolvedArtistId}
        onHide={() => setEditVisible(false)}
        onSaved={async () => {
          await load();
        }}
      />

      <AlbumFormDialog
        visible={albumCreateVisible}
        mode="create"
        artistId={resolvedArtistId}
        onHide={() => setAlbumCreateVisible(false)}
        onSaved={async () => {
          await load();
        }}
      />

      <AlbumFormDialog
        visible={albumEditId != null}
        mode="edit"
        albumId={albumEditId}
        onHide={() => setAlbumEditId(null)}
        onSaved={async () => {
          setAlbumEditId(null);
          await load();
        }}
      />
    </Dialog>
  );
}
