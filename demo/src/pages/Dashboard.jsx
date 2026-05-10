import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('nav.home')}</h2>

      <div className="card">
        <h3>{t('user.greeting', { name: 'Alice' })}</h3>
        <p>{t('user.welcomeBack', { name: 'Alice', time: '2026-05-10 14:30' })}</p>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">{t('user.balance', { amount: '' })}</span>
            <span className="stat-value">$1,280.00</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t('user.unreadMessages', { count: '' })}</span>
            <span className="stat-value">5</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>{t('notification.title')}</h3>
        <ul className="notif-list">
          <li className="notif-success">{t('notification.saveSuccess')}</li>
          <li className="notif-info">{t('notification.updateSuccess')}</li>
          <li className="notif-warning">{t('notification.copySuccess')}</li>
        </ul>
      </div>
    </div>
  );
}
