import { useEffect, useMemo, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { api } from '../../services/api';

type Regional = {
  id: number;
  nome: string;
  ativo: boolean;
  codigoExterno?: number | null;
};

export default function RegionaisPage() {
  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [novoNome, setNovoNome] = useState('');
  const [novoCodigo, setNovoCodigo] = useState<number | null>(null);
  const [novoAtivo, setNovoAtivo] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editAtivo, setEditAtivo] = useState(true);
  const [selectedRegional, setSelectedRegional] = useState<Regional | null>(null);

  const summary = useMemo(() => {
    if (!lastUpdated) return 'Nenhuma carga realizada ainda.';
    return `Última atualização: ${lastUpdated.toLocaleString()}`;
  }, [lastUpdated]);

  async function carregarRegionais() {
    setLoading(true);
    setError(null);
    setSyncMessage(null);
    try {
      const { data } = await api.get<Regional[]>('/v1/regionals');
      setRegionais(data);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar regionais.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function sincronizarRegionais() {
    setSyncLoading(true);
    setSyncMessage(null);
    setError(null);
    try {
      const { data } = await api.post<string>('/v1/regionals/sync');
      setSyncMessage(data ?? 'Sincronização concluída.');
      await carregarRegionais();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao sincronizar regionais.';
      setError(message);
    } finally {
      setSyncLoading(false);
    }
  }

  async function criarRegional() {
    setError(null);
    setSyncMessage(null);
    try {
      await api.post('/v1/regionals', {
        nome: novoNome,
        ativo: novoAtivo,
        codigoExterno: novoCodigo ?? undefined
      });
      setNovoNome('');
      setNovoCodigo(null);
      setNovoAtivo(true);
      await carregarRegionais();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao criar regional.';
      setError(message);
    }
  }

  function abrirEdicao(regional: Regional) {
    setSelectedRegional(regional);
    setEditNome(regional.nome);
    setEditAtivo(regional.ativo);
    setDialogVisible(true);
  }

  async function salvarEdicao() {
    if (!selectedRegional) return;
    setError(null);
    try {
      await api.put(`/v1/regionals/${selectedRegional.id}`, {
        nome: editNome,
        ativo: editAtivo
      });
      setDialogVisible(false);
      await carregarRegionais();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao atualizar regional.';
      setError(message);
    }
  }

  async function alternarAtivo(regional: Regional) {
    setError(null);
    try {
      await api.put(`/v1/regionals/${regional.id}`, {
        nome: regional.nome,
        ativo: !regional.ativo
      });
      await carregarRegionais();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao atualizar status.';
      setError(message);
    }
  }

  useEffect(() => {
    carregarRegionais();
  }, []);

  return (
    <div className="p-2">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 16
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Regionais</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-color-secondary)' }}>
            Consulte as regionais ativas e gerencie inserções e alterações.
          </p>
          <small style={{ color: 'var(--text-color-secondary)' }}>{summary}</small>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button
            label="Atualizar lista"
            icon="pi pi-refresh"
            onClick={carregarRegionais}
            loading={loading}
            className="app-button-secondary"
          />
          <Button
            label="Sincronizar base"
            icon="pi pi-cloud-upload"
            onClick={sincronizarRegionais}
            loading={syncLoading}
            className="app-button-primary"
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <Tag value={`Total: ${regionais.length}`} severity="info" />
        {syncMessage ? <Tag value={syncMessage} severity="success" /> : null}
      </div>

      {error ? <div className="p-error mb-3">{error}</div> : null}

      <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: 'var(--surface-50)' }}>
        <strong>Nova regional</strong>
        <div style={{ display: 'grid', gap: 12, marginTop: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <span className="p-float-label">
            <InputText id="regional-nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
            <label htmlFor="regional-nome">Nome</label>
          </span>
          <span className="p-float-label">
            <InputNumber
              id="regional-codigo"
              value={novoCodigo ?? undefined}
              onValueChange={(e) => setNovoCodigo(e.value ?? null)}
              useGrouping={false}
            />
            <label htmlFor="regional-codigo">Código externo (opcional)</label>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox inputId="regional-ativo" checked={novoAtivo} onChange={(e) => setNovoAtivo(e.checked ?? true)} />
            <label htmlFor="regional-ativo">Ativo</label>
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            label="Criar regional"
            icon="pi pi-plus"
            onClick={criarRegional}
            disabled={!novoNome.trim()}
            className="app-button-primary"
          />
        </div>
      </div>

      <DataTable
        value={regionais}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Nenhuma regional encontrada."
        responsiveLayout="scroll"
      >
        <Column field="id" header="ID" style={{ width: 90 }} />
        <Column field="codigoExterno" header="Código externo" style={{ width: 160 }} />
        <Column field="nome" header="Nome" />
        <Column
          header="Status"
          body={(row: Regional) => (
            <Tag value={row.ativo ? 'Ativo' : 'Inativo'} severity={row.ativo ? 'success' : 'danger'} />
          )}
          style={{ width: 140, textAlign: 'center' }}
        />
        <Column
          header="Ações"
          body={(row: Regional) => (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Button icon="pi pi-pencil" rounded text onClick={() => abrirEdicao(row)} />
              <Button
                icon={row.ativo ? 'pi pi-eye-slash' : 'pi pi-eye'}
                rounded
                text
                severity={row.ativo ? 'danger' : 'success'}
                onClick={() => alternarAtivo(row)}
              />
            </div>
          )}
          style={{ width: 160, textAlign: 'center' }}
        />
      </DataTable>

      <Dialog
        header="Editar regional"
        visible={dialogVisible}
        style={{ width: 'min(420px, 92vw)' }}
        onHide={() => setDialogVisible(false)}
        footer={
          <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
            <Button label="Cancelar" text onClick={() => setDialogVisible(false)} />
            <Button label="Salvar" icon="pi pi-check" onClick={salvarEdicao} />
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <span className="p-float-label">
            <InputText id="regional-edit-nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} />
            <label htmlFor="regional-edit-nome">Nome</label>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox
              inputId="regional-edit-ativo"
              checked={editAtivo}
              onChange={(e) => setEditAtivo(e.checked ?? true)}
            />
            <label htmlFor="regional-edit-ativo">Ativo</label>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
