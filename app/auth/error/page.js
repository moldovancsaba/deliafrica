import { Anchor, BodyText, GdsStack, PageTitle } from "@/app/components/gds";
import Link from 'next/link';
import { getSiteSettings } from '@/lib/site-settings';
export default async function AuthError() {
  const settings = await getSiteSettings();
  const copy = settings.uiCopy.authError;
  return <GdsStack component="main" gap="md" padding="md"><span>{copy.eyebrow}</span><PageTitle>{copy.title}</PageTitle><BodyText>{copy.body}</BodyText><Anchor href="/api/auth/login">{copy.retry}</Anchor><Anchor href="/">{copy.back}</Anchor></GdsStack>;
}
