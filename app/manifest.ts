import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Apotti Provider App',
    short_name: 'Apotti Provider',
    description: 'Provider standalone SMART on FHIR application for Apotti',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0056b3',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
