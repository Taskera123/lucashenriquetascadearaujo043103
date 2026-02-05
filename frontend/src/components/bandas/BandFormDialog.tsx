import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { MultiSelect } from 'primereact/multiselect';
import { BandaService } from '../../services/BandaService';
import { AlbumFacade } from '../../facades/AlbumFacade';
import type { ArtistaDTO, ArtistaResponseDTO, BandaResponseDTO } from '../../types/api';


type Props = {
  visible: boolean;
  mode: 'create' | 'edit';
  bandId?: number | null;
  onHide: () => void;
  onSaved?: (band: BandaResponseDTO) => void | Promise<void>;
};

export default function BandFormDialog({ visible, mode, bandId, onHide, onSaved }: Props) {
  const [nomeBanda, setNomeBanda] = useState('');
  const [artists, setArtists] = useState<ArtistaDTO[]>([]);
  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([]);
  const [initialArtistIds, setInitialArtistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeArtists = (list: ArtistaResponseDTO[] | ArtistaDTO[]) => {
    return (list ?? []).map((artist) => ({
      ...artist,
      id: (artist as ArtistaDTO).id ?? (artist as ArtistaResponseDTO).idArtista ?? null,
      nome: (artist as ArtistaDTO).nome ?? (artist as ArtistaResponseDTO).nomeArtista ?? ''
    })) as ArtistaDTO[];
  };

  const title = useMemo(() => (mode === 'create' ? 'Nova banda' : 'Editar banda'), [mode]);

  useEffect(() => {
    if (!visible) return;
    setError(null);
    setSaving(false);
    setInitialArtistIds([]);
    setSelectedArtistIds([]);
    if (mode === 'edit' && bandId) {
      setLoading(true);
      (async () => {
        try {
          const { data } = await BandaService.obterPorId(bandId);
          setNomeBanda(data.nomeBanda ?? '');
          const { data: artistas } = await BandaService.listarArtistas(bandId);
          const ids = (artistas ?? [])
            .map((a) => a.idArtista)
            .filter((id): id is number => typeof id === 'number');
          setInitialArtistIds(ids);
          setSelectedArtistIds(ids);
        } catch (e: any) {
          setError(e?.message ?? 'Erro ao carregar banda');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setNomeBanda('');
      setLoading(false);
    }
  }, [visible, mode, bandId]);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      const catalog = await AlbumFacade.loadCatalog();
      setArtists(normalizeArtists(catalog.artists ?? []));
    })();
  }, [visible]);

  async function salvar() {
    setError(null);
    const nome = nomeBanda.trim();
    if (!nome) { setError('Informe o nome da banda.'); return; }
    setSaving(true);
    try {
      let saved: BandaResponseDTO;
      let savedId: number | null = null;
      if (mode === 'create') {
        const { data } = await BandaService.criar({ nomeBanda: nome });
        saved = data;
        savedId = data.idBanda ?? (data as any).id ?? null;
      } else {
        if (!bandId) throw new Error('ID da banda inválido.');
        const { data } = await BandaService.atualizar(bandId, { nomeBanda: nome });
        saved = data;
        savedId = bandId;
      }

      if (savedId) {
        const currentSet = new Set(selectedArtistIds);
        const initialSet = new Set(initialArtistIds);
        const toAdd = [...currentSet].filter((id) => !initialSet.has(id));
        const toRemove = [...initialSet].filter((id) => !currentSet.has(id));

        for (const idArtista of toAdd) {
          await BandaService.vincularArtista(savedId, idArtista);
        }
        for (const idArtista of toRemove) {
          await BandaService.desvincularArtista(savedId, idArtista);
        }
      }

      await onSaved?.(saved);
      onHide();
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  const footer = (
    <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
      <Button label="Cancelar" className="app-button-secondary" onClick={onHide} disabled={saving} />
      <Button label={saving ? 'Salvando...' : 'Salvar'} icon="pi pi-check" className="app-button-primary" onClick={salvar} disabled={saving || loading} />
    </div>
  );

  return (
    <Dialog
      header={title}
      visible={visible}
      onHide={onHide}
      // className="app-dialog"
      style={{ width: 'min(700px, 30vw)' }}
      modal
      footer={footer}
    >
      {error ? <Message severity="error" text={error} className="mb-3" /> : null}
      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <span style={{ fontSize: 12, opacity: 0.75, display: 'grid', gap: 6 }}>Nome da banda</span>
        <InputText className="w-full" value={nomeBanda} onChange={(e) => setNomeBanda(e.target.value)} disabled={loading} />
        
          <span style={{ fontSize: 12, opacity: 0.75, display: 'grid', gap: 6 }}>Artistas (opcional), você pode deixar vazio e adicionar depois.</span>
          <MultiSelect
            value={selectedArtistIds}
            options={(artists ?? [])
              .map((a) => ({ label: a.nome ?? `Artista #${a.id}`, value: a.id ?? null }))
              .filter((opt) => opt.value != null)}
            optionLabel="label"
            optionValue="value"
            placeholder="Selecionar artistas"
            className="w-full"
            display="chip"
            onChange={(e) => setSelectedArtistIds((e.value ?? []).filter((id: number | null) => typeof id === 'number'))}
            disabled={loading}
          />
      </div>
    </Dialog>
  );
}
