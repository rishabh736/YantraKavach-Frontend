import { DocPage } from '../components/DocPage';
import { SITE } from '../config/site';

export default function Terms() {
  return (
    <DocPage title="Terms of Use"
      intro={`These terms apply to your use of the ${SITE.name} website and software. By using them you agree to these terms.`}
      sections={[
        { h: 'The service', p: [`${SITE.name} monitors machine condition using sensors and software and produces alerts and maintenance recommendations.`] },
        { h: 'Advisory only', p: ['Predictions, health scores and recommendations are decision-support information. They are not a guarantee that a machine will or will not fail, and they do not replace qualified inspection, manufacturer instructions, or safety procedures. Always follow your plant’s safety rules.'] },
        { h: 'Illustrative content', p: ['Sample figures, machine names and charts shown on this website are illustrative unless your plant systems are connected. They do not describe any real plant, customer or result.'] },
        { h: 'Accounts', p: ['Keep your login details confidential and tell us promptly about any unauthorised use. Administrators are responsible for the access they grant to their team.'] },
        { h: 'Acceptable use', p: ['You agree not to:', ['attempt to disrupt or gain unauthorised access to the service;', 'reverse engineer the software except as the law allows;', 'use the service for unlawful purposes.']] },
        { h: 'Intellectual property', p: ['The software, design and content belong to their owners. You keep ownership of your plant data and give us permission to process it to provide the service.'] },
        { h: 'Limitation of liability', p: ['To the extent the law permits, we are not liable for indirect or consequential losses, including lost production, arising from use of the service. Nothing here limits liability that cannot be limited by law.'] },
        { h: 'Governing law', p: ['These terms are governed by the laws of India. Courts at [city, state — placeholder] have jurisdiction, subject to any written agreement between us.'] },
        { h: 'Contact', p: [`${SITE.legalName} · ${SITE.email} · ${SITE.address}`] },
      ]} />
  );
}
