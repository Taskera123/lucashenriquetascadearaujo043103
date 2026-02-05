import { createBrowserRouter, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';
const ArtistListPage = React.lazy(() => import('../pages/artistas/ArtistaListPage'));
const ArtistDetailPage = React.lazy(() => import('../pages/artistas/ArtistaDetailPage'));
const ArtistFormPage = React.lazy(() => import('../pages/artistas/ArtistaFormPage'));
const HealthPage = React.lazy(() => import('../pages/health/HealthPage'));
const BandsListPage = React.lazy(() => import('../pages/bandas/BandaListPage'));
const BandDetailPage = React.lazy(() => import('../pages/bandas/BandaDetailPage'));
const BandFormPage = React.lazy(() => import('../pages/bandas/BandaFormPage'));
const AlbumListPage = React.lazy(() => import('../pages/albums/AlbumListPage'));
const AlbumDetailPage = React.lazy(() => import('../pages/albums/AlbumDetailPage'));
const AlbumFormPage = React.lazy(() => import('../pages/albums/AlbumFormPage'));
const RegionaisPage = React.lazy(() => import('../pages/regionais/RegionaisPage'));


function lazy(el: React.ReactNode) {
  return <Suspense fallback={<div style={{ padding: 16 }}>Carregando...</div>}>{el}</Suspense>;
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: lazy(
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: lazy(<ArtistListPage />) },
      { path: 'artistas', element: lazy(<ArtistListPage />) },
      { path: 'artistas/new', element: lazy(<ArtistFormPage mode="create" />) },
      { path: 'artistas/:id', element: lazy(<ArtistDetailPage />) },
      { path: 'artistas/:id/edit', element: lazy(<ArtistFormPage mode="edit" />) },
      { path: 'health', element: lazy(<HealthPage />) },
      { path: 'albums', element: lazy(<AlbumListPage />) },
      { path: 'albums/new', element: lazy(<AlbumFormPage mode="create" />) },
      { path: 'albums/:albumId', element: lazy(<AlbumDetailPage />) },
      { path: 'albums/:albumId/edit', element: lazy(<AlbumFormPage mode="edit" />) },
      { path: 'artistas/:id/albums', element: lazy(<AlbumListPage />) },
      { path: 'artistas/:id/albums/new', element: lazy(<AlbumFormPage mode="create" />) },
      { path: 'bandas', element: lazy(<BandsListPage />) },
      { path: 'bandas/new', element: lazy(<BandFormPage mode="create" />) },
      { path: 'bandas/:id', element: lazy(<BandDetailPage />) },
      { path: 'bandas/:id/edit', element: lazy(<BandFormPage mode="edit" />) },
      { path: 'regionais', element: lazy(<RegionaisPage />) }
    ]
  }
]);
