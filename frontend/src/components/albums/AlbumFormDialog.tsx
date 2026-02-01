import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { AlbumService } from '../../services/AlbumService';
import { ArtistService } from '../../services/ArtistaService';
import { BandaService } from '../../services/BandaService';
import type { AlbumCapaDTO, ArtistaDTO, BandaResponseDTO } from '../../types/api';
import AlbumCoverUploader from './AlbumCoverUploader';

type Props = {
  visible: boolean;
  mode: 'create' | 'edit';
  artistId?: number | null;
  albumId?: number | null;
  onHide: () => void;
  onSaved?: (albumId: number | null) => void | Promise<void>;
};

export default function AlbumFormDialog({ visible, mode, artistId, albumId, onHide, onSaved }: Props) {
  const [tituloAlbum, setTituloAlbum] = useState('');
  const [idArtista, setIdArtista] = useState<number>(artistId ?? 0);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [capas, setCapas] = useState<AlbumCapaDTO[]>([]);
  const [coverPage, setCoverPage] = useState(0);
  const [artists, setArtists] = useState<ArtistaDTO[]>([]);
  const [bands, setBands] = useState<BandaResponseDTO[]>([]);
  const [selectedBandId, setSelectedBandId] = useState<number | null>(null);
  const [bandArtistIds, setBandArtistIds] = useState<number[]>([]);
  const [principalUpdatingId, setPrincipalUpdatingId] = useState<number | null>(null);
  const [principalError, setPrincipalError] = useState<string | null>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [uploadingExtras, setUploadingExtras] = useState(false);
  const [extraError, setExtraError] = useState<string | null>(null);
  const extraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => (mode === 'create' ? 'Novo álbum' : 'Editar álbum'), [mode]);

  useEffect(() => {
    if (!visible) return;
    setPickedFile(null);
    setCoverPage(0);
    setPrincipalError(null);
    setSelectedBandId(null);
    setExtraFiles([]);
    setExtraError(null);
    if (extraInputRef.current) {
      extraInputRef.current.value = '';
    }
    if (mode === 'edit' && albumId) {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const { data } = await AlbumService.obterPorId(albumId);
          setTituloAlbum(data.tituloAlbum ?? '');
          setIdArtista(data.idArtista ?? 0);
          const { data: capaList } = await AlbumService.listarCapas(albumId);
          setCapas(capaList ?? []);
        } catch (e: any) {
          setError(e?.message ?? 'Erro ao carregar álbum');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setTituloAlbum('');
      setIdArtista(artistId ?? 0);
      setCapas([]);
      setLoading(false);
    }
  }, [visible, mode, albumId, artistId]);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const { data } = await ArtistService.listarTodos({ pagina: 0, tamanho: 500, ordenacao: 'asc' });
        setArtists(data.content ?? []);
      } catch {
        setArtists([]);
      }
      try {
        const { data: bandList } = await BandaService.listarTodos();
        setBands(bandList ?? []);
      } catch {
        setBands([]);
      }
    })();
  }, [visible]);

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
    const list = artists ?? [];
    const filtered = selectedBandId ? list.filter((a) => a.id != null && bandArtistIds.includes(a.id)) : list;
    return filtered.map((a) => ({ label: a.nome ?? `Artista #${a.id}`, value: a.id ?? null }))
      .filter((o) => o.value != null);
  }, [artists, selectedBandId, bandArtistIds]);

  const bandOptions = useMemo(() => {
    return (bands ?? []).map((b) => ({ label: b.nomeBanda ?? `Banda #${b.idBanda}`, value: b.idBanda ?? null }))
      .filter((o) => o.value != null);
  }, [bands]);

  const coverItems = useMemo(() => capas.filter((capa) => !!capa.urlAssinada), [capas]);
  const coverCount = coverItems.length;
  const coverPageSize = 4;
  const coverTotalPages = Math.max(1, Math.ceil(coverCount / coverPageSize));
  const coverPageSafe = Math.min(coverPage, coverTotalPages - 1);
  const coverSlice = coverItems.slice(coverPageSafe * coverPageSize, (coverPageSafe + 1) * coverPageSize);

  async function handleDefinirPrincipal(capa: AlbumCapaDTO) {
    if (!albumId || !capa.idCapa || capa.principal) return;
    setPrincipalError(null);
    setPrincipalUpdatingId(capa.idCapa);
    try {
      await AlbumService.definirCapaPrincipal(albumId, capa.idCapa);
      setCapas((prev) => prev.map((item) => ({ ...item, principal: item.idCapa === capa.idCapa })));
    } catch (err: any) {
      setPrincipalError(err?.response?.data?.message ?? err?.message ?? 'Falha ao definir capa principal.');
    } finally {
      setPrincipalUpdatingId(null);
    }
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
    if (!extraFiles.length || !albumId) return;
    setUploadingExtras(true);
    setExtraError(null);
    try {
      await AlbumService.adicionarCapas(albumId, extraFiles);
      setExtraFiles([]);
      if (extraInputRef.current) extraInputRef.current.value = '';
      const { data: capaList } = await AlbumService.listarCapas(albumId);
      setCapas(capaList ?? []);
    } catch (err: any) {
      setExtraError(err?.response?.data?.message ?? err?.message ?? 'Falha ao enviar capas.');
    } finally {
      setUploadingExtras(false);
    }
  }

  async function salvar() {
    setError(null);

    const titulo = tituloAlbum.trim();
    if (!titulo) { setError('Informe o título do álbum.'); return; }
    if (!idArtista || idArtista <= 0) { setError('Selecione o artista.'); return; }

    setSaving(true);
    try {
      let savedId = albumId ?? null;
      if (mode === 'create') {
        const { data } = await AlbumService.criar({ tituloAlbum: titulo, idArtista });
        savedId = data.idAlbum ?? (data as any).id ?? null;

        if (savedId && pickedFile) {
          await AlbumService.uploadCapa(savedId, pickedFile);
        }
      } else {
        if (!albumId) throw new Error('ID do álbum inválido.');
        await AlbumService.atualizar(albumId, { tituloAlbum: titulo, idArtista });

        if (pickedFile) {
          await AlbumService.atualizarCapa(albumId, pickedFile);
        }
      }

      await onSaved?.(savedId);
      onHide();
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  const footer = (
    <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
      <Button label="Cancelar" text onClick={onHide} disabled={saving} />
      <Button label={saving ? 'Salvando...' : 'Salvar'} icon="pi pi-check" onClick={salvar} disabled={saving || loading} />
    </div>
  );

  return (
    <Dialog
      header={title}
      visible={visible}
      onHide={onHide}
      className="app-dialog"
      modal
      footer={footer}
    >
      <Card>
        {error ? <Message severity="error" text={error} className="mb-3" /> : null}

        <div style={{ display: 'grid', gap: 12, marginTop: 12  }}>
          <span style={{ fontSize: 12, opacity: 0.75, display: 'grid', gap: 6 }}>
            <label style={{ fontSize: 12, opacity: 0.75 }}>Título</label>
            <InputText className="w-full" value={tituloAlbum} onChange={(e) => setTituloAlbum(e.target.value)} disabled={loading} />
          </span>

          <span style={{ fontSize: 12, opacity: 0.75, display: 'grid', gap: 6 }}>
            <label style={{ fontSize: 12, opacity: 0.75 }}>Banda (opcional)</label>
            <Dropdown
              value={selectedBandId}
              options={bandOptions}
              placeholder="Selecionar banda"
              showClear
              className="w-full"
              onChange={(e) => { setSelectedBandId(e.value ?? null); }}
            />
          </span>

          <span style={{ fontSize: 12, opacity: 0.75, display: 'grid', gap: 6 }}>
            <label style={{ fontSize: 12, opacity: 0.75 }}>Artista</label>
            <Dropdown
              value={idArtista || null}
              options={artistOptions}
              placeholder={selectedBandId ? 'Selecionar artista da banda' : 'Selecionar artista'}
              showClear
              className="w-full"
              onChange={(e) => setIdArtista(e.value ?? 0)}
              disabled={loading || !!artistId}
            />
            {selectedBandId && !artistOptions.length ? (
              <small style={{ opacity: 0.7 }}>Essa banda não possui artistas cadastrados.</small>
            ) : null}
          </span>

           {mode !== 'edit' && (
            <div style={{ fontSize: 12, opacity: 0.75, display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 12, opacity: 0.75, display: 'grid', gap: 6 }}>Capa</label>
                <AlbumCoverUploader mode="create" onPickedFile={setPickedFile} buttonLabel="Selecionar capa" />
                {pickedFile ? <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>{pickedFile.name}</div> : null}
                <small style={{ fontSize: 12, opacity: 0.7, display: 'block', marginTop: 6 }}>
                Esta será a capa principal. Depois você pode adicionar outras imagens no detalhe do álbum.
                </small>
            </div>
           )}

          {mode === 'edit' ? (
            <div style={{ fontSize: 12, opacity: 0.75, display: 'grid', gap: 6 }}>
              <div style={{ fontWeight: 600 }}>Capas atuais</div>
              <small style={{ opacity: 0.7 }}>{coverCount} capa(s) cadastrada(s).</small>
              {coverCount ? (
                <>
                  <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                    {coverSlice.map((capa, index) => (
                      <div key={capa.idCapa ?? capa.chaveObjeto ?? index} style={{ position: 'relative' }}>
                        <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 8, overflow: 'hidden', background: '#f4f4f4' }}>
                          <img src={capa.urlAssinada ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <Checkbox
                            checked={!!capa.principal}
                            onChange={() => handleDefinirPrincipal(capa)}
                            disabled={principalUpdatingId != null}
                          />
                          <span style={{ fontSize: 12, opacity: 0.8 }}>
                            {capa.principal ? 'Principal' : 'Definir como principal'}
                          </span>
                        </div>
                        {capa.principal ? (
                          <Tag
                            value="Principal"
                            severity="success"
                            style={{ position: 'absolute', top: 8, left: 8 }}
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {coverTotalPages > 1 ? (
                    <div className="flex gap-2 items-center" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                      <Button
                        label="Anterior"
                        icon="pi pi-chevron-left"
                        text
                        disabled={coverPageSafe === 0}
                        onClick={() => setCoverPage((p) => Math.max(0, p - 1))}
                      />
                      <span style={{ fontSize: 12, opacity: 0.7 }}>
                        {coverPageSafe + 1} / {coverTotalPages}
                      </span>
                      <Button
                        label="Próxima"
                        icon="pi pi-chevron-right"
                        iconPos="right"
                        text
                        disabled={coverPageSafe >= coverTotalPages - 1}
                        onClick={() => setCoverPage((p) => Math.min(coverTotalPages - 1, p + 1))}
                      />
                    </div>
                  ) : null}
                </>
              ) : (
                <small style={{ opacity: 0.7 }}>Nenhuma capa cadastrada.</small>
              )}
              {principalError ? <small style={{ color: '#d32f2f' }}>{principalError}</small> : null}
              {capas.length > 1 ? (
                <small style={{ opacity: 0.7 }}>
                  A capa marcada como principal é exibida nos outros componentes.
                </small>
              ) : null}

              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
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
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </Dialog>
  );
}
