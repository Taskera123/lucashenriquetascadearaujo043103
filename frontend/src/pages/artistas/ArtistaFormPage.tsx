import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import ArtistFormDialog from '../../components/artistas/ArtistFormDialog';

export default function ArtistFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const nav = useNavigate();
  const { id } = useParams();
  const artistId = useMemo(() => (id ? Number(id) : null), [id]);

  return (
    <ArtistFormDialog
      visible
      mode={mode}
      artistId={artistId}
      onHide={() => nav(-1)}
      onSaved={async (saved) => {
        const idToGo = saved.idArtista ?? artistId;
        nav(idToGo ? `/admin/artistas/${idToGo}` : '/admin/artistas');
      }}
    />
  );
}
