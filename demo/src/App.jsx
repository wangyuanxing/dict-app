import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LocaleSwitcher from './components/LocaleSwitcher';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';

export default function App() {
  const { t } = useTranslation();

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="logo">Dict-App Demo</h1>
          <nav>
            <NavLink to="/">{t('nav.home')}</NavLink>
            <NavLink to="/products">{t('nav.products')}</NavLink>
            <NavLink to="/orders">{t('nav.orders')}</NavLink>
          </nav>
        </div>
        <LocaleSwitcher />
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>{t('footer.powered')}</p>
      </footer>
    </div>
  );
}
