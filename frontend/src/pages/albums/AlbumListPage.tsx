import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { Message } from 'primereact/message';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { AlbumService } from '../../services/AlbumService';
import { BandaService } from '../../services/BandaService';
import { updates$ } from '../../state/wsUpdates.store';
import type { AlbumDTO, BandaResponseDTO } from '../../types/api';
import AlbumFormDialog from '../../components/albums/AlbumFormDialog';
import resolveApiUrl from '../../utils/resolveApiUrl';


export default function AlbumListPage() {
  const nav = useNavigate();
  const { id } = useParams(); 
  const artistId = useMemo(() => (id ? Number(id) : null), [id]);

  const [albums, setAlbums] = useState<AlbumDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverUrlByAlbumId, setCoverUrlByAlbumId] = useState<Record<number, string>>({});
  const [bands, setBands] = useState<BandaResponseDTO[]>([]);
  const [selectedBandId, setSelectedBandId] = useState<number | null>(null);
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
  const [bandArtistIds, setBandArtistIds] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(12);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!artistId) {
        const { data } = await AlbumService.listarTodosPaginado({ pagina: 0, tamanho: 500, ordenacao: 'asc' });
        setAlbums(data.content ?? []);
        const { data: bandList } = await BandaService.listarTodos();
        setBands(bandList ?? []);
        return;
      }

      const { data } = await AlbumService.listarPorArtistaPaginado(artistId, { pagina: 0, tamanho: 50 });
      setAlbums(data.content ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar álbuns');
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  useEffect(() => {
    const sub = updates$.subscribe((event) => {
      if (event.entity === 'album' || event.entity === 'banda') {
        loadAlbums();
      }
    });
    return () => sub.unsubscribe();
  }, [loadAlbums]);

  useEffect(() => {
    if (!selectedBandId) {
      setBandArtistIds([]);
      return;
    }
    (async () => {
      try {
        const { data } = await BandaService.obterPorId(selectedBandId);
        const ids = (data.artistas ?? [])
          .map((a) => a.idArtista)
          .filter((id): id is number => typeof id === 'number');
        setBandArtistIds(ids);
      } catch {
        setBandArtistIds([]);
      }
    })();
  }, [selectedBandId]);

  const artistOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const album of albums) {
      if (album.idArtista != null && album.nomeArtista) {
        map.set(album.idArtista, album.nomeArtista);
      }
    }
    return Array.from(map.entries()).map(([value, label]) => ({ label, value }));
  }, [albums]);

  const bandOptions = useMemo(() => {
    return (bands ?? []).map((b) => ({ label: b.nomeBanda ?? `Banda #${b.idBanda}`, value: b.idBanda ?? null }))
      .filter((o) => o.value != null);
  }, [bands]);

  const filteredAlbums = useMemo(() => {
    let list = [...albums];
    if (selectedArtistId) {
      list = list.filter((a) => a.idArtista === selectedArtistId);
    }
    if (selectedBandId) {
      list = list.filter((a) => a.idArtista != null && bandArtistIds.includes(a.idArtista));
    }
    return list;
  }, [albums, selectedArtistId, selectedBandId, bandArtistIds]);

  const pagedAlbums = useMemo(() => {
    const start = page * rows;
    return filteredAlbums.slice(start, start + rows);
  }, [filteredAlbums, page, rows]);

  async function ensureCoverUrl(albumId?: number, signed?: string | null) {
    if (!albumId) return;
    // if (signed && signed.trim()) return;
    if (signed && signed.trim().startsWith('http')) return;
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
        <Card title={a.titulo ?? 'Sem título'} subTitle={a.nomeArtista ?? ''}  style={{ width: 'min(320px, 100%)' }}>
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
              <Button icon="pi pi-eye" text className="app-button-primary" onClick={() => a.id && nav(`/admin/albums/${a.id}`)} />
              <Button icon="pi pi-pencil" text className="app-button-secondary" onClick={() => a.id && openEdit(a.id)} />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function openCreate() {
    setDialogMode('create');
    setSelectedAlbumId(null);
    setDialogVisible(true);
  }

  function openEdit(id: number) {
    setDialogMode('edit');
    setSelectedAlbumId(id);
    setDialogVisible(true);
  }

  return (
  <div className="p-2">
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 12,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700 }}>
        {artistId ? `Álbuns do artista #${artistId}` : 'Álbuns'}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        {!artistId ? (
          <>
            <Dropdown
              value={selectedArtistId}
              options={artistOptions}
              placeholder="Filtrar por artista"
              showClear
              onChange={(e) => {
                setSelectedArtistId(e.value ?? null);
                setPage(0);
              }}
            />
            <Dropdown
              value={selectedBandId}
              options={bandOptions}
              placeholder="Filtrar por banda"
              showClear
              onChange={(e) => {
                setSelectedBandId(e.value ?? null);
                setPage(0);
              }}
            />
          </>
        ) : null}

        <Button
          label="Novo Álbum"
          icon="pi pi-plus"
          className="app-button-primary"
          onClick={openCreate}
        />
      </div>
    </div>

    {error ? <Message severity="error" text={error} /> : null}

    <DataView
      value={artistId ? albums : pagedAlbums}
      layout="grid"
      itemTemplate={itemTemplate}
      loading={loading}
      paginator={!artistId}
      rows={rows}
      totalRecords={!artistId ? filteredAlbums.length : undefined}
      first={!artistId ? page * rows : undefined}
      onPage={
        !artistId
          ? (e) => {
              const newRows = e.rows ?? rows;
              const newFirst = e.first ?? 0;
              setRows(newRows);
              setPage(Math.floor(newFirst / newRows));
            }
          : undefined
      }
      emptyMessage={!artistId ? 'Nenhum álbum encontrado.' : undefined}
    />

    <AlbumFormDialog
      visible={dialogVisible}
      mode={dialogMode}
      artistId={artistId}
      albumId={selectedAlbumId}
      onHide={() => setDialogVisible(false)}
      onSaved={async () => {
        await loadAlbums();
      }}
    />
  </div>
);

}
