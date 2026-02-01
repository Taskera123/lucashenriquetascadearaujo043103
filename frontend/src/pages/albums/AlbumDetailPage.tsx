import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlbumDetailDialog from '../../components/albums/AlbumDetailDialog';

export default function AlbumDetailPage() {
  const nav = useNavigate();
  const { albumId } = useParams();
  const id = useMemo(() => Number(albumId), [albumId]);

  return (
    <AlbumDetailDialog
      visible
      albumId={id}
      onHide={() => nav(-1)}
    />
  );
}
