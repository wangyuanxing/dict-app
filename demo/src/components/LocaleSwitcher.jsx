import React from 'react';
import { useTranslation } from 'react-i18next';
import { availableLocales } from '../i18n';

export default function LocaleSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      className="locale-switcher"
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      {availableLocales.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}
