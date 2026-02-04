import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Carousel } from 'primereact/carousel';
import { Message } from 'primereact/message';
import { InputText } from 'primereact/inputtext';
import { AlbumService } from '../../services/AlbumService';
import AlbumCoverUploader from './AlbumCoverUploader';
import type { AlbumCapaDTO, AlbumResponseDTO } from '../../types/api';
import AlbumFormDialog from './AlbumFormDialog';

type Props = {
  visible: boolean;
  albumId: number | null;
  onHide: () => void;
};

export default function AlbumDetailDialog({ visible, albumId, onHide }: Props) {
  const id = useMemo(() => (albumId ? Number(albumId) : null), [albumId]);
  const [album, setAlbum] = useState<AlbumResponseDTO | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [capas, setCapas] = useState<AlbumCapaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [uploadingExtras, setUploadingExtras] = useState(false);
  const [extraError, setExtraError] = useState<string | null>(null);
  const [visibleCoverUrl, setVisibleCoverUrl] = useState<string | null>(null);
  const [coverFallbackActive, setCoverFallbackActive] = useState(false);
  const [carouselFallbacks, setCarouselFallbacks] = useState<Record<number, boolean>>({});
  const extraInputRef = useRef<HTMLInputElement | null>(null);
  const inFlightRef = useRef<{ id: number | null; promise: Promise<void> | null }>({ id: null, promise: null });


  async function load() {
    if (!id) return;
    const inFlight = inFlightRef.current;
    if (inFlight.promise && inFlight.id === id) {
      await inFlight.promise;
      return;
    }

    const task = (async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await AlbumService.obterPorId(id);
      setAlbum(data);

      try {
        const { data: capaList } = await AlbumService.listarCapas(id);
        setCapas(capaList ?? []);
        const principal = (capaList ?? []).find((capa) => capa.principal);
        if (principal?.urlAssinada) {
          setCoverUrl(principal.urlAssinada);
          return;
        }
      } catch {}

      try {
        const { data: url } = await AlbumService.obterUrlCapa(id);
        if (typeof url === 'string' && url.trim()) setCoverUrl(url);
      } catch {}
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar álbum');
    } finally {
      setLoading(false);
    }
  })();

    inFlightRef.current = { id, promise: task };
    await task;
    if (inFlightRef.current.promise === task) {
      inFlightRef.current = { id, promise: null };
    }

  }

  useEffect(() => {
    if (!visible) return;
    load();
  }, [visible, id]);

  useEffect(() => {
    setCoverFallbackActive(false);
    setCarouselFallbacks({});
  }, [id]);


  const carouselItems = capas.filter((capa) => !!capa.urlAssinada);

  function renderCover(capa: AlbumCapaDTO) {
    const capaId = capa.idCapa ?? 0;
    const fallbackActive = capaId ? carouselFallbacks[capaId] : false;
    const imageUrl =
      fallbackActive && id && capaId
        ? `/v1/albums/${id}/capas/${capaId}/arquivo`
        : (capa.urlAssinada ?? '');
    return (
      <div className="p-2" style={{ direction: 'ltr' }}>
        <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f4f4f4' }}>
          {/* <img src={capa.urlAssinada ?? ''} style={{ width: '100%', height: 260, objectFit: 'cover' }} /> */}
          <img
            src={imageUrl}
            style={{ width: '100%', height: 260, objectFit: 'cover' }}
            onError={() => {
              if (!capaId || fallbackActive) return;
              setCarouselFallbacks((prev) => ({ ...prev, [capaId]: true }));
            }}
          />
          {capa.principal ? (
            <span
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: '#2e7d32',
                color: '#fff',
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 999
              }}
            >
              Principal
            </span>
          ) : null}
        </div>
        <div className="flex" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <Button
            label="Ver URL da imagem"
            icon="pi pi-link"
            className="app-button-secondary"
            onClick={() => setVisibleCoverUrl(capa.urlAssinada ?? null)}
          />
        </div>
      </div>
    );
  }

  function handleExtraPicker() {
    setExtraError(null);
    extraInputRef.current?.click();
  }

  function handleExtraChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const invalid = files.find((file) => !file.type.startsWith('image/'));
    if (invalid) {
      setExtraError('Selecione apenas arquivos de imagem.');
      event.target.value = '';
      return;
    }
    setExtraFiles(files);
  }

  async function handleExtraUpload() {
    if (!extraFiles.length || !id) return;
    setUploadingExtras(true);
    setExtraError(null);
    try {
      await AlbumService.adicionarCapas(id, extraFiles);
      setExtraFiles([]);
      if (extraInputRef.current) extraInputRef.current.value = '';
      await load();
    } catch (err: any) {
      setExtraError(err?.response?.data?.message ?? err?.message ?? 'Falha ao enviar capas.');
    } finally {
      setUploadingExtras(false);
    }
  }

  return (
    <Dialog
      header="Detalhe do Álbum"
      visible={visible}
      onHide={onHide}
      style={{ width: 'min(900px, 50vw)' }}
      // className="app-dialog"
      modal
    >
      {error ? <Message severity="error" text={error} /> : null}

      <Card title={album?.tituloAlbum ?? '...'} subTitle={album?.nomeArtista ?? ''}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ width: '100%', maxWidth: 520 }}>
            {carouselItems.length ? (
              <Carousel
                value={carouselItems}
                numVisible={1}
                numScroll={1}
                itemTemplate={renderCover}
                showIndicators={carouselItems.length > 1}
                showNavigators={carouselItems.length > 1}
              />
            ) : (
                <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 8, overflow: 'hidden', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>  
              {coverUrl ? (
                  <img
                    src={coverFallbackActive && id ? `/v1/albums/capa/${id}` : coverUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => {
                      if (!coverFallbackActive) setCoverFallbackActive(true);
                    }}
                  />
                ) : (
                  <div style={{ opacity: 0.7, textAlign: 'center' }}>
                    <i className="pi pi-image" style={{ fontSize: 28 }} />
                    <div style={{ fontSize: 12, marginTop: 8 }}>Sem capa</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {visibleCoverUrl ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontWeight: 600 }}>URL da imagem</div>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                <Button
                  label="Fechar"
                  icon="pi pi-times"
                  className="app-button-secondary"
                  onClick={() => setVisibleCoverUrl(null)}
                />
              </div>
              <InputText className="w-full" value={visibleCoverUrl} readOnly />
            </div>
          ) : null}

          <div className="flex gap-2" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button label="Editar" icon="pi pi-pencil" className="app-button-secondary" onClick={() => setEditVisible(true)} />
            {/* {id ? (
              <AlbumCoverUploader
                mode="update"
                albumId={id}
                buttonLabel="Trocar capa"
                onUploaded={async () => load()}
              />
            ) : null} */}
          </div>

          {/* <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 600 }}>Adicionar novas capas</div>
            <input
              ref={extraInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleExtraChange}
            />
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <Button
                label="Selecionar imagens"
                icon="pi pi-images"
                className="app-button-secondary"
                onClick={handleExtraPicker}
                disabled={uploadingExtras}
              />
              <Button
                label={uploadingExtras ? 'Enviando...' : 'Adicionar capas'}
                icon="pi pi-upload"
                className="app-button-primary"
                onClick={handleExtraUpload}
                disabled={!extraFiles.length || uploadingExtras}
              />
            </div>
            {extraFiles.length ? (
              <small style={{ opacity: 0.7 }}>
                {extraFiles.length} arquivo(s) selecionado(s). A primeira capa permanece como principal.
              </small>
            ) : null}
            {extraError ? <small style={{ color: '#d32f2f' }}>{extraError}</small> : null}
          </div> */}

          {loading ? <Message severity="info" text="Carregando..." /> : null}
        </div>
      </Card>

      <AlbumFormDialog
        visible={editVisible}
        mode="edit"
        albumId={id}
        onHide={() => setEditVisible(false)}
        onSaved={async () => {
          await load();
        }}
      />
    </Dialog>
  );
}
