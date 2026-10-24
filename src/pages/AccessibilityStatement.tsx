import { DocPage } from '../components/DocPage';
import { SITE } from '../config/site';

export default function AccessibilityStatement() {
  return (
    <DocPage title="Accessibility statement"
      intro={`${SITE.name} aims to be usable by everyone, including people who use assistive technology. We design toward WCAG 2.1 Level AA and the principles of India's GIGW guidelines. We have not yet been through a formal third-party audit.`}
      sections={[
        { h: 'What we provide', p: [['A “Skip to main content” control at the top of every page.', 'Adjustable text size (A−, A, A+) and a high-contrast mode.', 'English and Hindi language options for the main public pages and navigation.', 'Full keyboard navigation with visible focus indicators.', 'Status shown with text as well as colour (for example “CRITICAL”, not only red).', 'Labelled forms, page titles and landmarks for screen readers.', 'Respect for the “reduce motion” setting of your device.']] },
        { h: 'Known limitations', p: [['Hindi translation currently covers navigation and key public content; the operational dashboard is in English.', 'Live charts are visual. Their values are also available in the machine and sensor tables, but we are working on richer text alternatives.', 'Some technical terms (such as “vibration mm/s”) are shown in standard engineering notation.']] },
        { h: 'Feedback', p: [`If you find a barrier, please write to ${SITE.supportEmail} or call ${SITE.phone} (${SITE.hours}). Tell us the page and the problem, and we will respond within 5 working days.`] },
      ]} />
  );
}
