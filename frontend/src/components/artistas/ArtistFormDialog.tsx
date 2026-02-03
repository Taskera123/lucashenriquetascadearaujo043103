import { useEffect, useMemo, useState, useRef  } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import type { ArtistaResponseDTO } from '../../types/api';
import { ArtistService } from '../../services/ArtistaService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/albumartistaapi';

function resolveFotoUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

type Props = {
  visible: boolean;
  mode: 'create' | 'edit';
  artistId?: number | null;
  onHide: () => void;
  onSaved?: (artist: ArtistaResponseDTO) => void | Promise<void>;
};

export default function ArtistFormDialog({ visible, mode, artistId, onHide, onSaved }: Props) {
  const [nomeArtista, setNomeArtista] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  const title = useMemo(() => (mode === 'create' ? 'Novo artista' : 'Editar artista'), [mode]);

  useEffect(() => {
    if (!visible) return;
    setError(null);
    setSaving(false);
    setFotoFile(null);
    if (mode === 'edit' && artistId) {
      setLoading(true);
      (async () => {
        try {
          const { data } = await ArtistService.obterPorId(artistId);
          setNomeArtista(data.nomeArtista ?? '');
          setFotoPreview(resolveFotoUrl(data.urlFoto));
        } catch (e: any) {
          setError(e?.message ?? 'Erro ao carregar artista');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setNomeArtista('');
      setFotoPreview(null);
      setLoading(false);
    }
  }, [visible, mode, artistId]);

  useEffect(() => {
    if (!fotoFile) return;
    const url = URL.createObjectURL(fotoFile);
    setFotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [fotoFile]);

  async function salvar() {
    setError(null);
    const nome = nomeArtista.trim();
    if (!nome) {
      setError('Informe o nome do artista.');
      return;
    }

    setSaving(true);
    try {
      let saved: ArtistaResponseDTO;
      if (mode === 'create') {
        const { data } = await ArtistService.criar({ nomeArtista: nome });
        saved = data;
      } else {
        if (!artistId) {
          throw new Error('ID do artista inválido.');
        }
        const { data } = await ArtistService.atualizar(artistId, { nomeArtista: nome });
        saved = data;
      }

      const currentId = saved.idArtista ?? artistId;
      if (currentId && fotoFile) {
        const { data } = await ArtistService.atualizarFoto(currentId, fotoFile);
        saved = data;
      }

      await onSaved?.(saved);
      onHide();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erro ao salvar');
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
      // style={{ width: 'min(900px, 95vw)' }}
      className="app-dialog"
      modal
      footer={footer}
    >
      {error ? <Message severity="error" text={error} className="mb-3" /> : null}

       <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <span style={{ fontSize: 12, opacity: 0.75, display: 'grid', gap: 6 }}>Nome do artista</span>
          <InputText className="w-full" value={nomeArtista} onChange={(e) => setNomeArtista(e.target.value)} disabled={loading} />

          <span style={{ fontSize: 12, opacity: 0.75, display: 'grid', gap: 6 }}>Foto do artista</span>
          {fotoPreview ? (
            <div style={{ width: 160, height: 160, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
              <img src={fotoPreview} alt="Foto do artista" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ fontSize: 12, opacity: 0.7 }}>Nenhuma foto selecionada.</div>
          )}
          <div  style={{
            display: 'flex',
            alignItems: 'center',      
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => setFotoFile(e.target.files?.[0] ?? null)}
              disabled={saving}
            />
            <Button
              label={fotoFile ? 'Trocar foto' : 'Escolher foto'}
              icon="pi pi-upload"
              className="app-button-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
            />

            {fotoFile ? (
              <Button
                label="Remover"
                icon="pi pi-times"
                className="app-button-secondary"
                onClick={() => {
                  setFotoFile(null);
                  setFotoPreview(null);
                }}
                disabled={saving}
              />
            ) : null}
          </div>

        </div>
    </Dialog>
  );
}
