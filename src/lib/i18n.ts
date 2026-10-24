export type Lang = 'en' | 'hi';

/** English string -> Hindi. Anything missing falls back to English, so partial coverage is safe. */
const HI: Record<string, string> = {
  // utility bar
  'Skip to main content': 'मुख्य सामग्री पर जाएँ',
  'Text size': 'पाठ का आकार',
  'High contrast': 'उच्च कंट्रास्ट',
  'Language': 'भाषा',
  // public nav
  'Technology': 'तकनीक',
  'Trust': 'भरोसा',
  'About': 'हमारे बारे में',
  'Contact': 'संपर्क',
  'Log in': 'लॉग इन',
  'Open dashboard': 'डैशबोर्ड खोलें',
  // hero
  'MISSION CONTROL FOR INDUSTRIAL MACHINES': 'औद्योगिक मशीनों के लिए मिशन कंट्रोल',
  'Turn Legacy Machines Into Smart Machines.': 'पुरानी मशीनों को स्मार्ट मशीनें बनाएँ।',
  'Yantra Kavach brings affordable AI-powered predictive maintenance to MSMEs—without replacing existing machinery.':
    'यंत्र कवच MSME उद्योगों के लिए किफ़ायती, AI-आधारित प्रिडिक्टिव मेंटेनेंस लाता है—मौजूदा मशीनें बदले बिना।',
  'View Live Dashboard': 'लाइव डैशबोर्ड देखें',
  'Explore Technology': 'तकनीक जानें',
  'Monitoring': 'निगरानी',
  'Machine parameters': 'मशीन पैरामीटर',
  'Anomaly detection': 'असामान्यता की पहचान',
  'Friendly installation': 'आसान इंस्टॉलेशन',
  'One System. Complete Machine Visibility.': 'एक प्रणाली। मशीन की पूरी जानकारी।',
  'Built on facts you can check': 'ऐसे तथ्यों पर आधारित जिन्हें आप जाँच सकें',
  'Protecting Machines. Preventing Downtime.': 'मशीनों की सुरक्षा। डाउनटाइम की रोकथाम।',
  'System architecture': 'सिस्टम आर्किटेक्चर',
  // footer / legal
  'Privacy Policy': 'गोपनीयता नीति',
  'Terms of Use': 'उपयोग की शर्तें',
  'Accessibility': 'सुगम्यता',
  'Product': 'उत्पाद',
  'Legal': 'कानूनी',
  // sidebar
  'Dashboard': 'डैशबोर्ड',
  'Machines': 'मशीनें',
  'Sensors': 'सेंसर',
  'Alerts': 'अलर्ट',
  'Predictive Maintenance': 'प्रिडिक्टिव मेंटेनेंस',
  'Analytics': 'विश्लेषण',
  'Maintenance': 'रखरखाव',
  'Reports': 'रिपोर्ट',
  'Settings': 'सेटिंग्स',
  'Plant Overview': 'प्लांट अवलोकन',
  'Needs attention now': 'तुरंत ध्यान देने योग्य',
  'Machine grid': 'मशीन ग्रिड',
};

export const translate = (lang: Lang, s: string) => (lang === 'hi' ? HI[s] ?? s : s);
