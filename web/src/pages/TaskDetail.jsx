import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Tag, Progress, Button, Space, Input, message, Typography } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import client from '../api/client';

const { Text } = Typography;
const statusColors = { pending: 'default', completed: 'success', failed: 'error' };

export default function TaskDetail() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tResp, trResp] = await Promise.all([
        client.get(`/projects/${projectId}/tasks/${taskId}`),
        client.get(`/projects/${projectId}/translations`, { params: { task_id: taskId } }),
      ]);
      setTask(tResp.data);
      setTranslations(trResp.data.translations || trResp.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [projectId, taskId]);

  // Auto-refresh if processing
  useEffect(() => {
    if (task?.status !== 'processing') return;
    const timer = setInterval(fetchData, 3000);
    return () => clearInterval(timer);
  }, [task?.status]);

  const handleSave = async (tr) => {
    try {
      await client.put(`/projects/${projectId}/translations/${tr.id}`, { translated_value: editValue });
      setTranslations(translations.map((t) => (t.id === tr.id ? { ...t, translated_value: editValue } : t)));
      setEditingId(null);
      message.success('Updated');
    } catch { /* */ }
  };

  const handleRetry = async () => {
    try {
      await client.post(`/projects/${projectId}/tasks/${taskId}/retry`);
      message.success('Retrying failed translations');
      fetchData();
    } catch { /* */ }
  };

  const pct = task?.total_keys > 0 ? Math.round((task?.completed_keys / task?.total_keys) * 100) : 0;

  const columns = [
    { title: 'Key', dataIndex: 'key', key: 'key', width: '30%', render: (k) => <code style={{ fontSize: 12 }}>{k}</code> },
    { title: 'Source', dataIndex: 'source_value', key: 'source', width: '25%' },
    { title: 'Target Locale', dataIndex: 'target_locale', key: 'locale', width: 100 },
    {
      title: 'Translation', dataIndex: 'translated_value', key: 'translated',
      render: (value, record) => {
        if (editingId === record.id) {
          return (
            <Input.TextArea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleSave(record)}
              autoSize
            />
          );
        }
        return (
          <div style={{ cursor: 'pointer', minHeight: 22 }} onClick={() => { setEditingId(record.id); setEditValue(value || ''); }}>
            {value || <Text type="secondary">Pending...</Text>}
          </div>
        );
      },
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 100,
      render: (s) => <Tag color={statusColors[s] || 'default'}>{s}</Tag>,
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        <h1 style={{ margin: 0 }}>Task Detail</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchData} />
      </Space>

      {task && (
        <div style={{ marginBottom: 16, padding: 16, background: '#fff', borderRadius: 8 }}>
          <Progress percent={pct} />
          <div style={{ marginTop: 8 }}>
            <Text>Source: <Tag>{task.source_locale}</Tag></Text>
            <Text style={{ marginLeft: 16 }}>Targets: {(task.target_locales || []).map((l) => <Tag key={l}>{l}</Tag>)}</Text>
            <Text style={{ marginLeft: 16 }}>Status: <Tag color={statusColors[task.status]}>{task.status}</Tag></Text>
          </div>
          {task.status === 'failed' && (
            <div style={{ marginTop: 8 }}>
              <Text type="danger">{task.error_message}</Text>
              <Button size="small" style={{ marginLeft: 8 }} onClick={handleRetry}>Retry Failed</Button>
            </div>
          )}
        </div>
      )}

      <Table
        dataSource={translations}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 50 }}
      />
    </div>
  );
}
