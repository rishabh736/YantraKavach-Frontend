/**
 * EDIT THIS FILE before you publish the site.
 * Everything marked "placeholder" is shown on the website as "To be added" until you replace it with a real, checkable fact.
 * Do not add credentials, partners or results that you cannot prove.
 */
export const SITE = {
  name: 'Yantra Kavach',
  legalName: '[Registered entity name — placeholder]',
  tagline: 'Protecting Machines. Preventing Downtime.',
  email: 'contact@yourdomain.in',        // placeholder
  supportEmail: 'support@yourdomain.in', // placeholder
  phone: '+91 00000 00000',              // placeholder
  address: '[Registered office address — placeholder], Uttarakhand, India',
  hours: 'Mon–Sat, 9:30 am – 6:00 pm IST',
  lastUpdated: '21 September 2026',
  grievanceOfficer: { name: '[Name — placeholder]', email: 'grievance@yourdomain.in' },
};

export interface Credential { label: string; detail: string; number?: string; verifyUrl?: string }
export const CREDENTIALS: Credential[] = [
  { label: 'Udyam Registration', detail: 'MSME registration of the company. Add your Udyam number.' },
  { label: 'Startup India / DPIIT', detail: 'DPIIT recognition certificate number, if recognised.' },
  { label: 'Quality certification', detail: 'ISO 9001 or another certificate, if you hold one.' },
  { label: 'Institute / incubator', detail: 'Your college, incubator or industry body, if any.' },
];

export interface Member { name: string; role: string; bio?: string }
export const TEAM: Member[] = [
  { name: 'Your name', role: 'Founder & lead engineer' },
  { name: 'Team member', role: 'Embedded systems & sensors' },
  { name: 'Team member', role: 'Machine learning' },
  { name: 'Mentor', role: 'Industry mentor' },
];

export interface Pilot { plant: string; result: string; quote?: string }
/** Add real pilot results here once you have them. An empty list shows a "coming soon" card. */
export const PILOTS: Pilot[] = [];
