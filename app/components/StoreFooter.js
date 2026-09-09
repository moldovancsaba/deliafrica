import { GdsContainer, GdsStack, GdsInline, SectionTitle, BodyText, MetadataText, Anchor, SimpleGrid } from '@/app/components/gds';
export default function StoreFooter({
  legal,
  copy,
  version
}) {
  const company = legal?.company || {},
    docs = legal?.documents || {},
    footer = copy?.footer || {},
    social = copy?.social || {};
  return <GdsContainer component="footer" size="page" padding="lg"><GdsStack gap="lg"><SimpleGrid cols={{
        base: 1,
        md: 3
      }} spacing="lg">
    <GdsStack gap="sm"><SectionTitle order={2}>{company.companyName}</SectionTitle><BodyText>{company.contactName}</BodyText><BodyText>{company.address}</BodyText>{company.phone && <Anchor href={`tel:${company.phone.replace(/\s+/g, '')}`}>{company.phone}</Anchor>}{company.email && <Anchor href={`mailto:${company.email}`}>{company.email}</Anchor>}</GdsStack>
    <GdsStack component="nav" gap="sm" aria-label={footer.legalTitle}><SectionTitle order={2}>{footer.legalTitle}</SectionTitle>{['gtc', 'terms', 'cookies', 'consumer', 'privacy'].map(key => <Anchor key={key} href={`/legal/${key}`}>{docs[key]?.title}</Anchor>)}</GdsStack>
    <GdsStack gap="sm"><SectionTitle order={2}>{footer.socialTitle}</SectionTitle>{['instagram', 'x', 'facebook'].map(key => company[`${key}Url`] && <Anchor key={key} href={company[`${key}Url`]} target="_blank" rel="noreferrer">{social[key]} {company[key]}</Anchor>)}</GdsStack>
    </SimpleGrid><GdsInline gap="md" justify="between"><MetadataText>© {new Date().getFullYear()} {company.companyName} · {footer.rights}</MetadataText><MetadataText>v{version}</MetadataText></GdsInline></GdsStack></GdsContainer>;
}
