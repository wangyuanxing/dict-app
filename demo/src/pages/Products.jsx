import React from 'react';
import { useTranslation } from 'react-i18next';

const MOCK_PRODUCTS = [
  { id: 1, nameKey: 'product.name1', price: 299, stock: 42, img: '📱' },
  { id: 2, nameKey: 'product.name2', price: 159, stock: 18, img: '⌚' },
  { id: 3, nameKey: 'product.name3', price: 89, stock: 0, img: '🎧' },
];

export default function Products() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('product.title')}</h2>
      <div className="product-grid">
        {MOCK_PRODUCTS.map((p) => (
          <div key={p.id} className="product-card">
            <div className="product-img">{p.img}</div>
            <div className="product-info">
              <h4>{t(p.nameKey)}</h4>
              <p className="product-desc">{t('product.description')}</p>
              <div className="product-meta">
                <span>{t('product.price', { price: p.price })}</span>
                {p.stock > 0 ? (
                  <span className="in-stock">{t('product.stock', { count: p.stock })}</span>
                ) : (
                  <span className="out-of-stock">{t('product.outOfStock')}</span>
                )}
              </div>
              <div className="product-actions">
                <button className="btn btn-primary">{t('product.buyNow')}</button>
                <button className="btn" disabled={p.stock === 0}>
                  {t('product.addToCart')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
