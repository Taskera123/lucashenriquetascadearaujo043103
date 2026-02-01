import { useRef, useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { AlbumService } from '../../services/AlbumService';
import type { AlbumDTO } from '../../types/api';

type Props =
  | { mode: 'create'; onPickedFile: (file: File | null) => void; buttonLabel?: string; buttonIcon?: string }
  | { mode: 'update'; albumId: number; onUploaded?: (updated?: AlbumDTO) => void | Promise<void>; buttonLabel?: string; buttonIcon?: string };

export default function AlbumCoverUploader(props: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  const label = props.buttonLabel ?? (props.mode === 'update' ? 'Trocar capa' : 'Selecionar capa');

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function openPicker() {
    setError(null);
    inputRef.current?.click();
  }

  function clear() {
    setError(null);
    setUploading(false);
    setFile(null);

    if (inputRef.current) inputRef.current.value = '';

    if (props.mode === 'create') {
      props.onPickedFile(null);
    }
  }

  function validate(f: File): string | null {
    if (!f.type.startsWith('image/')) return 'Selecione um arquivo de imagem.';
    if (f.size > 10_000_000) return 'Arquivo muito grande. Máximo: 10MB.';
    return null;
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    const msg = validate(f);
    if (msg) {
      setError(msg);
      clear();
      return;
    }

    setFile(f);

    if (props.mode === 'create') {
      props.onPickedFile(f);
      return;
    }

    setUploading(true);
    try {
      const { data } = await AlbumService.atualizarCapa(props.albumId, f);
      await props.onUploaded?.(data);
      clear();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Falha ao enviar a capa.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <input
         ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onChange}
      />
      <Button
                    label="Selecionar capa"
                    icon="pi pi-upload"
                    className="app-button-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    
                  />

      {previewUrl ? (
        <div style={{ width: 180, aspectRatio: '1 / 1', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)' }}>
          <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          style={{
            display: 'inline-flex',
            gap: 8,
            alignItems: 'center',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.15)',
            background: 'white',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          <span>{uploading ? 'Enviando...' : label}</span>
        </button>

        {file ? (
          <button
            type="button"
            onClick={clear}
            disabled={uploading}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.15)',
              background: 'white',
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}
          >
            Limpar
          </button>
        ) : null}
      </div>

      {error ? <small style={{ color: '#d32f2f' }}>{error}</small> : null}
      {file ? <small style={{ opacity: 0.75 }}>{file.name}</small> : null}
    </div>
  );
}
