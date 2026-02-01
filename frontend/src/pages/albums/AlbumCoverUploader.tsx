import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { AlbumService } from '../../services/AlbumService';
import type { AlbumDTO } from '../../types/api';

type BaseProps = {
  buttonLabel?: string;
  buttonIcon?: string;
  maxSizeMB?: number; // default 10
  accept?: string;    // default "image/*"
};

type CreateProps = BaseProps & {
  mode: 'create';
  albumId?: never;
  onPickedFile: (file: File | null) => void;
  onUploaded?: never;
};

type UpdateProps = BaseProps & {
  mode: 'update';
  albumId: number;
  onUploaded?: (updated?: AlbumDTO) => void | Promise<void>;
  onPickedFile?: never;
};

type Props = CreateProps | UpdateProps;

export default function AlbumCoverUploader(props: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const accept = props.accept ?? 'image/*';
  const maxBytes = (props.maxSizeMB ?? 10) * 1024 * 1024;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const label = props.buttonLabel ?? (props.mode === 'update' ? 'Trocar capa' : 'Selecionar capa');
  const icon = props.buttonIcon ?? 'pi pi-upload';

  // cria / limpa preview url
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canUpload = useMemo(() => props.mode === 'update' && !!file && !uploading, [props.mode, file, uploading]);

  function openPicker() {
    setError(null);
    inputRef.current?.click();
  }

  function clearSelection() {
    setError(null);
    setFile(null);

    if (props.mode === 'create') {
      props.onPickedFile(null);
    }

    if (inputRef.current) inputRef.current.value = '';
  }

  function validate(f: File): string | null {
    if (!f.type.startsWith('image/')) return 'Selecione um arquivo de imagem.';
    if (f.size > maxBytes) return `Arquivo muito grande. Máximo: ${(maxBytes / (1024 * 1024)).toFixed(0)}MB.`;
    return null;
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    const msg = validate(f);
    if (msg) {
      setError(msg);
      clearSelection();
      return;
    }

    setFile(f);

    if (props.mode === 'create') {
      props.onPickedFile(f);
    } else {
      // update: não faz upload automaticamente (você pode mudar isso)
      // aqui só habilita o botão "Enviar"
    }
  }

  async function uploadNow() {
    if (props.mode !== 'update') return;
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const { data } = await AlbumService.atualizarCapa(props.albumId, file);
      await props.onUploaded?.(data);
      clearSelection();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Falha ao enviar a capa.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {/* input escondido */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      {/* preview */}
      {previewUrl ? (
        <div style={{ width: 180, aspectRatio: '1 / 1', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.12)' }}>
          <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : null}

      {/* ações */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button
          type="button"
          label={label}
          icon={icon}
          onClick={openPicker}
          disabled={uploading}
        />

        {file ? (
          <Button
            type="button"
            label="Limpar"
            icon="pi pi-times"
            severity="secondary"
            onClick={clearSelection}
            disabled={uploading}
          />
        ) : null}

        {props.mode === 'update' ? (
          <Button
            type="button"
            label={uploading ? 'Enviando...' : 'Enviar'}
            icon="pi pi-cloud-upload"
            onClick={uploadNow}
            disabled={!canUpload}
            severity="success"
          />
        ) : null}
      </div>

      {/* mensagens */}
      {error ? <small style={{ color: 'var(--red-500)' }}>{error}</small> : null}
      {file ? <small style={{ opacity: 0.75 }}>{file.name}</small> : null}
    </div>
  );
}
