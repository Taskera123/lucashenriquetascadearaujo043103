import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlbumFormDialog from '../../components/albums/AlbumFormDialog';

export default function AlbumFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const nav = useNavigate();
  const { id, albumId } = useParams();

  const artistId = useMemo(() => (id ? Number(id) : null), [id]);
  const idAlbum = useMemo(() => (albumId ? Number(albumId) : null), [albumId]);

  return (
    <AlbumFormDialog
      visible
      mode={mode}
      artistId={artistId}
      albumId={idAlbum}
      onHide={() => nav(-1)}
      onSaved={async () => {
        nav(-1);
      }}
    />
  );
}
