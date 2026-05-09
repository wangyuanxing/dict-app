import React, { useEffect, useState } from 'react';
import { Table, Tabs, Input, Button, Space, Popconfirm, message, Tag } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import client from '../api/client';

export default function LocaleManager() {
  const { projectId } = useParams();
  const [locales, setLocales] = useState([]);
  const [activeLocale, setActiveLocale] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const fetchLocales = async () => {
    try {
      const resp = await client.get(`/projects/${projectId}/locales`);
      setLocales(resp.data);
      if (resp.data.length > 0 && !activeLocale) {
        setActiveLocale(resp.data[0]);
      }
    } catch { /* */ }
  };

  const fetchEntries = async () => {
    if (!activeLocale) return;
    setLoading(true);
    try {
      const resp = await client.get(`/projects/${projectId}/entries`, {
        params: { locale: activeLocale, search: search || undefined },
      });
      setEntries(resp.data.entries || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocales(); }, [projectId]);
  useEffect(() => { fetchEntries(); }, [activeLocale, projectId]);

  const handleSave = async (entry) => {
    try {
      await client.put(`/projects/${projectId}/entries/${entry.id}`, { value: editingValue });
      setEntries(entries.map((e) => (e.id === entry.id ? { ...e, value: editingValue } : e)));
      setEditingKey(null);
      message.success('Updated');
    } catch { /* */ }
  };

  const handleDelete = async (entry) => {
    try {
      await client.delete(`/projects/${projectId}/entries/${entry.id}`);
      setEntries(entries.filter((e) => e.id !== entry.id));
      message.success('Deleted');
    } catch { /* */ }
  };

  const columns = [
    {
      title: 'Key', dataIndex: 'key', key: 'key', width: '40%',
      render: (key) => <code style={{ fontSize: 13 }}>{key}</code>,
    },
    {
      title: 'Value', dataIndex: 'value', key: 'value',
      render: (value, record) => {
        if (editingKey === record.id) {
          return (
            <Input.TextArea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={() => handleSave(record)}
              onPressEnter={(e) => { e.preventDefault(); handleSave(record); }}
              autoSize
            />
          );
        }
        return (
          <div
            style={{ cursor: 'pointer', minHeight: 22 }}
            onClick={() => { setEditingKey(record.id); setEditingValue(value); }}
          >
            {value}
          </div>
        );
      },
    },
    {
      title: 'Actions', key: 'actions', width: 80,
      render: (_, record) => (
        <Popconfirm title="Delete this entry?" onConfirm={() => handleDelete(record)}>
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <h1>Locale Manager</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
        <Tabs
          activeKey={activeLocale}
          onChange={setActiveLocale}
          items={locales.map((l) => ({ key: l, label: l }))}
          style={{ flex: 1 }}
        />
        <Input.Search
          placeholder="Search keys..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={fetchEntries}
          style={{ width: 250 }}
        />
        <Button icon={<ReloadOutlined />} onClick={fetchEntries} />
      </div>
      <Table
        dataSource={entries}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 50, showSizeChanger: true }}
      />
    </div>
  );
}
