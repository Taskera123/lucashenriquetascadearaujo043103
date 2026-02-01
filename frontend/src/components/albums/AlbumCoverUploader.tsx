import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { AlbumService } from '../../services/AlbumService';
import type { AlbumDTO } from '../../types/api';

type Props =
  | { mode: 'create'; onPickedFile: (file: File | null) => void; buttonLabel?: string; buttonIcon?: string }
  | { mode: 'update'; albumId: number; onUploaded?: (updated?: AlbumDTO) => void | Promise<void>; buttonLabel?: string; buttonIcon?: string };

export default function AlbumCoverUploader(props: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = props.buttonLabel ?? (props.mode === 'update' ? 'Trocar capa' : 'Selecionar capa');
  const icon = props.buttonIcon ?? 'pi pi-upload';

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function clear() {
    setError(null);
    setUploading(false);
    setFile(null);

    // 🔥 MUITO IMPORTANTE: limpar o valor do input REAL
    if (fileInputRef.current) fileInputRef.current.value = '';

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

      // garante que dá pra selecionar o mesmo arquivo de novo
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFile(null);

      if (props.mode === 'create') props.onPickedFile(null);
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
        label={label}
        icon={icon}
        className="app-button-secondary"
        onClick={() => {
          setError(null);
          fileInputRef.current?.click();
        }}
        disabled={uploading}
      />

      {previewUrl ? (
        <div
          style={{
            width: 180,
            aspectRatio: '1 / 1',
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.12)',
          }}
        >
          <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : null}

      {file ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            type="button"
            onClick={clear}
            className="app-button-secondary"
            disabled={uploading}
            label="Remover"
            icon="pi pi-times"
          />
        </div>
      ) : null}

      {error ? <small style={{ color: '#d32f2f' }}>{error}</small> : null}
      {file ? <small style={{ opacity: 0.75 }}>{file.name}</small> : null}
    </div>
  );
}
