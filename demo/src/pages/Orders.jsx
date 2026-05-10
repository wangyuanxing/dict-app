import React from 'react';
import { useTranslation } from 'react-i18next';

const MOCK_ORDERS = [
  { no: '202605101430001', status: 'pending', amount: 299, time: '2026-05-10 14:30' },
  { no: '202605091200042', status: 'shipped', amount: 159, time: '2026-05-09 12:00' },
  { no: '202605081645018', status: 'delivered', amount: 89, time: '2026-05-08 16:45' },
];

export default function Orders() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('order.title')}</h2>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>{t('order.orderNo', { no: '' }).replace(': ', '')}</th>
              <th>{t('order.createTime', { time: '' }).replace(': ', '')}</th>
              <th>{t('order.totalAmount', { amount: '' }).replace(': ', '')}</th>
              <th>{t('order.status.pending').split('|')[0]}</th>
              <th>{t('common.edit')}</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ORDERS.map((o) => (
              <tr key={o.no}>
                <td><code>{o.no}</code></td>
                <td>{o.time}</td>
                <td>¥{o.amount.toFixed(2)}</td>
                <td>
                  <span className={`badge badge-${o.status}`}>
                    {t(`order.status.${o.status}`)}
                  </span>
                </td>
                <td>
                  {o.status === 'pending' ? (
                    <button className="btn btn-sm">{t('order.cancelOrder')}</button>
                  ) : o.status === 'shipped' ? (
                    <button className="btn btn-sm btn-primary">{t('order.confirmReceipt')}</button>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-footer">
          <span>{t('table.total', { total: MOCK_ORDERS.length })}</span>
        </div>
      </div>
    </div>
  );
}
