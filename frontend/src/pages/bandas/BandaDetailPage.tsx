import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import BandDetailDialog from '../../components/bandas/BandDetailDialog';

export default function BandaDetailPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const bandId = useMemo(() => Number(id), [id]);

  return (
    <BandDetailDialog
      visible
      bandId={bandId}
      onHide={() => nav(-1)}
    />
  );
}
