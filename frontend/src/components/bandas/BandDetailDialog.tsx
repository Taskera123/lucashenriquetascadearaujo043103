import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Message } from 'primereact/message';
import { BandaService } from '../../services/BandaService';
import type { BandaResponseDTO, ArtistaResumoDTO } from '../../types/api';
import BandFormDialog from './BandFormDialog';

type Props = {
  visible: boolean;
  bandId: number | null;
  onHide: () => void;
};

export default function BandDetailDialog({ visible, bandId, onHide }: Props) {
  const [band, setBand] = useState<BandaResponseDTO | null>(null);
  const [artists, setArtists] = useState<ArtistaResumoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editVisible, setEditVisible] = useState(false);

  const resolvedBandId = useMemo(() => (bandId ? Number(bandId) : null), [bandId]);

  const load = useCallback(async () => {
    if (!resolvedBandId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await BandaService.obterPorId(resolvedBandId);
      setBand(data);
      setArtists(data.artistas ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar banda');
    } finally {
      setLoading(false);
    }
  }, [resolvedBandId]);

  useEffect(() => {
    if (!visible) return;
    load();
  }, [visible, load]);

  return (
    <Dialog
      header={band?.nomeBanda ?? 'Banda'}
      visible={visible}
      onHide={onHide}
      style={{ width: 'min(900px, 95vw)' }}
      modal
    >
      {error ? <Message severity="error" text={error} className="mb-3" /> : null}

      <div className="flex gap-2 items-center mb-3" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{band?.nomeBanda ?? 'Banda'}</div>
        <Button
          label="Editar banda"
          icon="pi pi-pencil"
          className="app-button-secondary"
          onClick={() => setEditVisible(true)}
        />
      </div>

      <Card className="mb-4">
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>Data de criação:</strong> {band?.dataCriacao ?? '-'}</div>
          <div><strong>Atualizado em:</strong> {band?.dataAtualizacao ?? '-'}</div>
        </div>
      </Card>

      <div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Artistas na banda</div>
        <DataTable value={artists} loading={loading} emptyMessage="Nenhum artista vinculado." responsiveLayout="scroll">
          <Column field="idArtista" header="ID" style={{ width: 90 }} />
          <Column field="nomeArtista" header="Artista" />
        </DataTable>
      </div>

      <BandFormDialog
        visible={editVisible}
        mode="edit"
        bandId={resolvedBandId}
        onHide={() => setEditVisible(false)}
        onSaved={async () => {
          await load();
        }}
      />
    </Dialog>
  );
}
