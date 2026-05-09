import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Space, Typography, message } from 'antd';
import { PlusOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import client from '../api/client';

const { Text } = Typography;

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const { selectProject } = useProject();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const resp = await client.get('/projects');
      setProjects(resp.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const resp = await client.post('/projects', { name: newName.trim() });
      setProjects([resp.data, ...projects]);
      setModalOpen(false);
      setNewName('');
      message.success('Project created');
    } catch { /* error shown by interceptor */ }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p.id !== id));
      message.success('Project deleted');
    } catch { /* error shown by interceptor */ }
  };

  const handleEnter = (project) => {
    selectProject(project);
    navigate(`/projects/${project.id}/locales`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Project ID', dataIndex: 'id', key: 'id',
      render: (id) => (
        <Space>
          <Text code>{id}</Text>
          <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(id)} />
        </Space>
      ),
    },
    {
      title: 'API Key', dataIndex: 'api_key', key: 'api_key',
      render: (key) => (
        <Space>
          <Text code>{key.slice(0, 8)}...</Text>
          <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(key)} />
        </Space>
      ),
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => handleEnter(record)}>Enter</Button>
          <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Projects</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Create Project
        </Button>
      </div>
      <Table dataSource={projects} columns={columns} rowKey="id" loading={loading} />
      <Modal
        title="Create Project"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
      >
        <Input
          placeholder="Project name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onPressEnter={handleCreate}
        />
      </Modal>
    </div>
  );
}
