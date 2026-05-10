import React, { useEffect, useState } from 'react';
import { Table, Button, Drawer, Select, Space, message, Tag, Progress, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';

const { Text } = Typography;

const statusColors = { pending: 'default', processing: 'processing', completed: 'success', failed: 'error' };

export default function TranslationTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [locales, setLocales] = useState([]);
  const [sourceLocale, setSourceLocale] = useState(null);
  const [targetLocales, setTargetLocales] = useState([]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const resp = await client.get(`/projects/${projectId}/tasks`);
      setTasks(resp.data.tasks || resp.data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocales = async () => {
    try {
      const resp = await client.get(`/projects/${projectId}/locales`);
      const data = resp.data;
      // locales: [{code, label}, ...] — all common locales for dropdown
      setLocales(data.locales || data || []);
    } catch { /* */ }
  };

  useEffect(() => { fetchTasks(); fetchLocales(); }, [projectId]);

  // Auto-refresh processing tasks
  useEffect(() => {
    const hasProcessing = tasks.some((t) => t.status === 'processing');
    if (!hasProcessing) return;
    const timer = setInterval(fetchTasks, 3000);
    return () => clearInterval(timer);
  }, [tasks]);

  const handleCreate = async () => {
    if (!sourceLocale || targetLocales.length === 0) {
      message.warning('Select source and target locales');
      return;
    }
    try {
      await client.post(`/projects/${projectId}/tasks`, {
        source_locale: sourceLocale,
        target_locales: targetLocales,
      });
      message.success('Task created');
      setDrawerOpen(false);
      setSourceLocale(null);
      setTargetLocales([]);
      fetchTasks();
    } catch { /* */ }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', render: (id) => <Text code>{id.slice(0, 8)}</Text> },
    { title: 'Source', dataIndex: 'source_locale', key: 'source', width: 80 },
    {
      title: 'Targets', dataIndex: 'target_locales', key: 'targets',
      render: (locales) => (locales || []).map((l) => <Tag key={l}>{l}</Tag>),
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s) => <Tag color={statusColors[s] || 'default'}>{s}</Tag>,
    },
    {
      title: 'Progress', key: 'progress',
      render: (_, r) => {
        const pct = r.total_keys > 0 ? Math.round((r.completed_keys / r.total_keys) * 100) : 0;
        return <Progress percent={pct} size="small" />;
      },
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Button type="link" onClick={() => navigate(`/projects/${projectId}/tasks/${r.id}`)}>Detail</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Translation Tasks</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchTasks} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
            New Task
          </Button>
        </Space>
      </div>

      <Table dataSource={tasks} columns={columns} rowKey="id" loading={loading} />

      <Drawer title="New Translation Task" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={400}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Source Language</div>
          <Select
            value={sourceLocale}
            onChange={setSourceLocale}
            placeholder="Select source language"
            style={{ width: '100%' }}
            options={locales.map((l) => ({ label: `${l.label} (${l.code})`, value: l.code }))}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Target Languages</div>
          <Select
            mode="tags"
            value={targetLocales}
            onChange={setTargetLocales}
            placeholder="Select or type target languages (e.g. ja_JP)"
            style={{ width: '100%' }}
            options={locales.filter((l) => l.code !== sourceLocale).map((l) => ({ label: `${l.label} (${l.code})`, value: l.code }))}
          />
        </div>
        <Button type="primary" block onClick={handleCreate}>Start Translation</Button>
      </Drawer>
    </div>
  );
}
