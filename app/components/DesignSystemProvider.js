'use client';

import { GdsBox, GdsProvider, OverlayManagerProvider, useGdsThemePresetState } from '@sovereignsquad/gds/client';

export default function DesignSystemProvider({ children }) {
  const { selection } = useGdsThemePresetState({
    storageKey: 'deli-gds-coral-v1',
    initialSelection: { preset: 'coral', colorScheme: 'light', fontLane: 'inter' },
  });
  return <GdsProvider locale="hu" theme={selection.theme} forceColorScheme="light"><OverlayManagerProvider><GdsBox bg="var(--gds-vibe-canvas)" c="var(--gds-vibe-text)">{children}</GdsBox></OverlayManagerProvider></GdsProvider>;
}
