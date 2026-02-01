import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BandFormDialog from '../../components/bandas/BandFormDialog';

export default function BandaFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const nav = useNavigate();
  const { id } = useParams();
  const bandId = useMemo(() => (id ? Number(id) : null), [id]);

  return (
    <BandFormDialog
      visible
      mode={mode}
      bandId={bandId}
      onHide={() => nav(-1)}
      onSaved={async () => {
        nav(-1);
      }}
    />
  );
}
