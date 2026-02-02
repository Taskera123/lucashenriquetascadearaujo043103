import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { artistList$, ArtistFacade } from '../../facades/ArtistFacade';
import type { AlbumDTO, SortDir } from '../../types/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import ArtistFormDialog from '../../components/artistas/ArtistFormDialog';
import ArtistDetailDialog from '../../components/artistas/ArtistDetailDialog';
import { updates$ } from '../../state/wsUpdates.store';
import resolveApiUrl from '../../utils/resolveApiUrl';


export default function ArtistListPage() {
  const nav = useNavigate();
  const [s, setS] = useState(artistList$.value);
  const [albums, setAlbums] = useState<AlbumDTO[]>([]);
  const [albumLoading, setAlbumLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailArtistId, setDetailArtistId] = useState<number | null>(null);

  useEffect(() => {
    const sub = artistList$.subscribe(setS);
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    ArtistFacade.search();
  }, [s.page, s.size, s.sortDir]);

  const loadAlbums = useCallback(async () => {
    setAlbumLoading(true);
    try {
      const artistAlbums = (s.content ?? []).flatMap((artist) => artist.albuns ?? []);
      if (artistAlbums.length) {
        setAlbums(artistAlbums);
        return;
      }

      const { data } = await ArtistFacade.getAllAlbums();
      setAlbums(data);
    } finally {
      setAlbumLoading(false);
    }
  }, [s.content]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  useEffect(() => {
    const sub = updates$.subscribe((event) => {
      if (event.entity === 'album' && event.action === 'created') {
        loadAlbums();
      }
      if (event.entity === 'artista' && event.action === 'created') {
        ArtistFacade.search();
      }
    });
    return () => sub.unsubscribe();
  }, [loadAlbums]);

  const sortOptions: { label: string; value: SortDir }[] = [
    { label: 'A → Z', value: 'asc' },
    { label: 'Z → A', value: 'desc' }
  ];

  const albumCarouselItems = useMemo(() => {
    const unique = new Map<number, AlbumDTO>();
    for (const album of albums) {
      if (album.id != null && !unique.has(album.id)) unique.set(album.id, album);
    }
    return Array.from(unique.values());
  }, [albums]);

  function resolveAlbumCover(album: AlbumDTO) {
    // return album.urlImagemCapaAssinada?.trim() || album.urlImagemCapa?.trim() || '';
    const url = album.urlImagemCapaAssinada?.trim() || album.urlImagemCapa?.trim() || '';
    return resolveApiUrl(url);
  }

  const albumTemplate = (album: AlbumDTO) => {
    const coverUrl = resolveAlbumCover(album);
    return (
      <div className="p-2" style={{ direction: 'ltr' }}>
        <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {coverUrl ? (
              <img src={coverUrl} alt={album.titulo ?? 'Álbum'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ opacity: 0.7, textAlign: 'center' }}>
                <i className="pi pi-image" style={{ fontSize: 28 }} />
                <div style={{ fontSize: 12, marginTop: 8 }}>Sem capa</div>
              </div>
            )}
          </div>
          <div style={{ padding: 12 }}>
            <div style={{ fontWeight: 700 }}>{album.titulo ?? 'Sem título'}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{album.nomeArtista ?? ''}</div>
            {album.id ? (
              <Button
                label="Ver detalhes"
                icon="pi pi-eye"
                text
                className="app-button-primary"
                onClick={() => nav(`/admin/albums/${album.id}`)}
                style={{ padding: 0, marginTop: 8 }}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  function openCreate() {
    setDialogMode('create');
    setSelectedArtistId(null);
    setDialogVisible(true);
  }

  function openEdit(id: number) {
    setDialogMode('edit');
    setSelectedArtistId(id);
    setDialogVisible(true);
  }

  function openDetail(id: number) {
    setDetailArtistId(id);
    setDetailVisible(true);
  }

  return (
    <div className="p-2">
      <div className="mb-4">
        {/* <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Artistas e Álbuns cadastrados</div> */}
        <Carousel
          value={albumCarouselItems}
          numVisible={3}
          numScroll={3}
          itemTemplate={albumTemplate}
          circular={albumCarouselItems.length > 3}
          autoplayInterval={albumCarouselItems.length > 3 ? 5000 : 2000}
          showIndicators={albumCarouselItems.length > 3}
          showNavigators={albumCarouselItems.length > 3}
          style={{ maxWidth: 1100, margin: '0 auto'}}
          responsiveOptions={[
            { breakpoint: '1200px', numVisible: 3, numScroll: 3 },
            { breakpoint: '900px', numVisible: 2, numScroll: 2 },
            { breakpoint: '600px', numVisible: 1, numScroll: 1 }
          ]}
        />
        {albumLoading && !albumCarouselItems.length ? (
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>Carregando álbuns...</div>
        ) : null}
      </div>

       <div style={{ fontSize: 18, fontWeight: 700 , marginBottom: 8}}>
         Artistas
       </div>

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
    <span
      className="p-input-icon-right"
      style={{
        flex: '1 1 420px',
        minWidth: 260,
        display: 'block',
      }}
    >
      <i
        className="pi pi-search"
        style={{
          right: 12,
          fontSize: 14,
          opacity: 0.7,
        }}
      />
      <InputText
        placeholder="Pesquisar artista (mín. 2 letras)"
        value={s.query}
        onChange={(e) => ArtistFacade.setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && ArtistFacade.search()}
        style={{ width: '100%' }}
      />
    </span>

    <Dropdown
      value={s.sortDir}
      options={sortOptions}
      onChange={(e) => ArtistFacade.setSortDir(e.value)}
      placeholder="Ordenar"
      style={{ width: 160 }}
    />

    <Button
      label="Buscar"
      icon="pi pi-search"
      className="app-button-primary"
      onClick={() => ArtistFacade.search()}
    />

    <Button
      label="Novo"
      icon="pi pi-plus"
      className="app-button-primary"
      onClick={openCreate}
    />
  </div>


      {s.error ? <div className="p-error mb-2">{s.error}</div> : null}

      <DataTable
        value={s.content}
        loading={s.loading}
        lazy
        paginator
        rows={s.size}
        first={s.page * s.size}
        totalRecords={s.total}
        onPage={(e) => {
          const newSize = e.rows ?? s.size;
          const newPage = Math.floor((e.first ?? 0) / newSize);
          ArtistFacade.setPage(newPage, newSize);
        }}
        rowHover
        responsiveLayout="scroll"
        emptyMessage={s.query.trim().length < 2 ? 'Digite ao menos 2 letras.' : 'Nenhum artista encontrado.'}
        onRowClick={(e) => {
          const id = (e.data as any).id as number | undefined;
          if (id != null) openDetail(id);
        }}
      >
        <Column field="nome" header="Artista" />
        <Column field="quantidadeAlbuns" header="Nº de Álbuns" style={{ width: 140, textAlign: 'center' }} />
        <Column
          header="Ações"
          body={(row: any) => (
            <div className="flex gap-2">
              <Button icon="pi pi-eye" rounded text className="app-button-primary" onClick={() => openDetail(row.id)} />
              <Button icon="pi pi-pencil" rounded text className="app-button-secondary" severity="info" onClick={() => openEdit(row.id)} />
            </div>
          )}
          style={{ width: 140, textAlign: 'center' }}
        />
      </DataTable>

      <ArtistFormDialog
        visible={dialogVisible}
        mode={dialogMode}
        artistId={selectedArtistId}
        onHide={() => setDialogVisible(false)}
        onSaved={async () => {
          await ArtistFacade.search();
        }}
      />

      <ArtistDetailDialog
        visible={detailVisible}
        artistId={detailArtistId}
        onHide={() => setDetailVisible(false)}
      />
    </div>
  );
}
