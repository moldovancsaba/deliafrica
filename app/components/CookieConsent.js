'use client';
import { useEffect, useState } from 'react';
import { Modal, BodyText, Anchor, GdsInline, Button } from '@sovereignsquad/gds/client';
const KEY = 'deli-cookie-consent';
export default function CookieConsent({ copy }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { try { setVisible(!localStorage.getItem(KEY)); } catch { setVisible(true); } }, []);
  function choose(value) {
    try { localStorage.setItem(KEY, value); } catch { /* Consent still applies to this visit. */ }
    window.dispatchEvent(new CustomEvent('deli-consent-change', { detail: value }));
    setVisible(false);
  }
  if (!copy) return null;
  return <Modal opened={visible} onClose={() => choose('necessary')} title={copy.title} closeButtonProps={{ 'aria-label': copy.reject }}>
    <BodyText>{copy.body} <Anchor href="/legal/cookies">{copy.policyLink}</Anchor></BodyText>
    <GdsInline gap="md" padding="md"><Button variant="default" onClick={() => choose('necessary')}>{copy.reject}</Button><Button onClick={() => choose('all')}>{copy.accept}</Button></GdsInline>
  </Modal>;
}
