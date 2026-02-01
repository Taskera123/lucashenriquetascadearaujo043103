import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { bandList$, BandFacade } from '../../facades/BandFacade';
import { updates$ } from '../../state/wsUpdates.store';
import type { SortDir } from '../../types/api';
import BandFormDialog from '../../components/bandas/BandFormDialog';
import BandDetailDialog from '../../components/bandas/BandDetailDialog';

export default function BandsPage() {
  const nav = useNavigate();
  const [s, setS] = useState(bandList$.value);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedBandId, setSelectedBandId] = useState<number | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailBandId, setDetailBandId] = useState<number | null>(null);

  useEffect(() => {
    const sub = bandList$.subscribe(setS);
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    BandFacade.load();
  }, [s.page, s.size, s.sortDir]);

  useEffect(() => {
    const sub = updates$.subscribe((event) => {
      if (event.entity === 'banda') {
        BandFacade.load();
      }
    });
    return () => sub.unsubscribe();
  }, []);

  const sortOptions: { label: string; value: SortDir }[] = [
    { label: 'A → Z', value: 'asc' },
    { label: 'Z → A', value: 'desc' }
  ];
  
  function openCreate() {
    setDialogMode('create');
    setSelectedBandId(null);
    setDialogVisible(true);
  }

  function openEdit(id: number) {
    setDialogMode('edit');
    setSelectedBandId(id);
    setDialogVisible(true);
  }

  function openDetail(id: number) {
    setDetailBandId(id);
    setDetailVisible(true);
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
        Bandas
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
        <Dropdown
          value={s.sortDir}
          options={sortOptions}
          onChange={(e) => BandFacade.setSortDir(e.value)}
          placeholder="Ordenar"
          style={{ width: 180 }} // opcional
        />

        <Button
          label="Nova banda"
          icon="pi pi-plus"
          className="app-button-primary"
          onClick={openCreate}
        />
      </div>
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
          BandFacade.setPage(newPage, newSize);
        }}
        rowHover
        responsiveLayout="scroll"
        emptyMessage="Nenhuma banda encontrada."
        onRowClick={(e) => {
          const id = (e.data as any).idBanda as number | undefined;
          if (id != null) openDetail(id);
        }}
      >
        <Column field="nomeBanda" header="Banda" />
        <Column
          header="Artistas"
          body={(row: any) => (row.artistas?.length ?? 0)}
          style={{ width: 140, textAlign: 'center' }}
        />
        <Column
          header="Ações"
          body={(row: any) => (
            <div className="flex gap-2">
              <Button icon="pi pi-eye" rounded text className="app-button-primary" onClick={() => openDetail(row.idBanda)} />
              <Button icon="pi pi-pencil" rounded text className="app-button-secondary" onClick={() => openEdit(row.idBanda)} />
            </div>
          )}
          style={{ width: 140, textAlign: 'center' }}
        />
      </DataTable>

      <BandFormDialog
        visible={dialogVisible}
        mode={dialogMode}
        bandId={selectedBandId}
        onHide={() => setDialogVisible(false)}
        onSaved={async () => {
          await BandFacade.load();
        }}
      />

      <BandDetailDialog
        visible={detailVisible}
        bandId={detailBandId}
        onHide={() => setDetailVisible(false)}
      />
    </div>
  );
}
