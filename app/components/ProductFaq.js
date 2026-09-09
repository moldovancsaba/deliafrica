'use client';
import { Accordion, BodyText } from '@sovereignsquad/gds/client';
export default function ProductFaq({ items }) {
 return <Accordion>{items.map(([question,answer])=><Accordion.Item key={question} value={question}><Accordion.Control>{question}</Accordion.Control><Accordion.Panel><BodyText>{answer}</BodyText></Accordion.Panel></Accordion.Item>)}</Accordion>;
}
