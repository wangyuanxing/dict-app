import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Dynamically discover all locale JSON files at build time
const localeModules = import.meta.glob('../locale/*.json', { eager: true });

const LABEL_MAP = {
  zh_CN: '简体中文', zh_TW: '繁體中文', zh_HK: '繁體中文（香港）',
  en_US: 'English (US)', en_GB: 'English (UK)',
  ja_JP: '日本語', ko_KR: '한국어',
  fr_FR: 'Français', de_DE: 'Deutsch', es_ES: 'Español',
  pt_BR: 'Português (BR)', pt_PT: 'Português (PT)',
  ru_RU: 'Русский', ar_SA: 'العربية',
  th_TH: 'ไทย', vi_VN: 'Tiếng Việt',
  id_ID: 'Bahasa Indonesia', tr_TR: 'Türkçe',
  it_IT: 'Italiano', nl_NL: 'Nederlands',
  pl_PL: 'Polski', sv_SE: 'Svenska',
  hi_IN: 'हिन्दी', ms_MY: 'Bahasa Melayu',
};

export function getLabel(code) {
  return LABEL_MAP[code] || code;
}

// Build locale list and resources from discovered files
const availableLocales = [];
const resources = {};

for (const [path, mod] of Object.entries(localeModules)) {
  const code = path.match(/\/([^/]+)\.json$/)[1];
  availableLocales.push({ code, label: getLabel(code) });
  resources[code] = { translation: mod.default };
}

export { availableLocales };

// Ensure zh_CN is first (fallback default)
availableLocales.sort((a, b) => {
  if (a.code === 'zh_CN') return -1;
  if (b.code === 'zh_CN') return 1;
  return a.code.localeCompare(b.code);
});

const defaultLocale = resources.zh_CN ? 'zh_CN' : availableLocales[0]?.code || 'en_US';

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLocale,
  fallbackLng: defaultLocale,
  interpolation: {
    escapeValue: false,
    prefix: '{',
    suffix: '}',
  },
});

export default i18n;
