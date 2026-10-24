import { DocPage } from '../components/DocPage';
import { SITE } from '../config/site';

export default function Privacy() {
  return (
    <DocPage title="Privacy Policy"
      intro={`This policy explains what personal and operational data ${SITE.name} handles, why, and what choices you have. It is written with India's Digital Personal Data Protection Act, 2023 in mind.`}
      sections={[
        { h: 'Data we handle', p: ['We handle three kinds of data:', ['Account data: name, work email, role and login activity.', 'Plant data: machine sensor readings (vibration, temperature, sound, current, voltage), alerts, maintenance records and reports.', 'Contact data: details you send through the contact form, such as name, company, phone and message.']] },
        { h: 'Why we use it', p: ['To provide and secure the monitoring service, generate alerts and predictions, respond to your enquiries, and improve reliability. We do not sell personal data, and we do not use plant data for advertising.'] },
        { h: 'Preferences on your device', p: ['Preferences such as theme, text size and language are stored on your device only (local storage) and are not sent to a server.'] },
        { h: 'Storage and retention', p: ['Data is kept only as long as needed to run your service or meet legal obligations, and is then deleted or anonymised. Where a hosting provider is used, the provider and location will be named in your service agreement.'] },
        { h: 'Sharing', p: ['We share data only with service providers who help us operate the platform (for example cloud hosting or email delivery), under confidentiality obligations, or when the law requires it.'] },
        { h: 'Security', p: ['We use role-based access, encrypted connections (HTTPS) and access logging. No system is perfectly secure; we will notify affected users and authorities as required by law if a breach occurs.'] },
        { h: 'Your rights', p: ['You may ask to access, correct or erase your personal data, withdraw consent, and nominate someone to exercise these rights on your behalf. To do so, or to raise a complaint, contact our grievance officer.'] },
        { h: 'Grievance officer', p: [`${SITE.grievanceOfficer.name} · ${SITE.grievanceOfficer.email} · ${SITE.phone}. We aim to acknowledge complaints within 48 hours and resolve them within 30 days.`] },
        { h: 'Changes', p: ['We will post updates on this page and change the “last updated” date above.'] },
      ]} />
  );
}
