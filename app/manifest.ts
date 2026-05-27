import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PhD Planner — Research Hub',
    short_name: 'PhDPlanner',
    description: 'The all-in-one planner for PhD researchers. Track papers, experiments, deadlines, and more.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0f1e',
    theme_color: '#f59e0b',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['education', 'productivity'],
    screenshots: [
      {
        src: '/icons/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        // @ts-ignore
        form_factor: 'wide',
      },
    ],
  }
}
