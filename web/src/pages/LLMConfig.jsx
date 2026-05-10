import React, { useEffect, useState } from 'react';
import { Form, Select, Input, Button, Card, message, Space } from 'antd';
import { SaveOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import client from '../api/client';

const PROVIDERS = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic Claude', value: 'anthropic' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'OpenAI Compatible', value: 'openai_compatible' },
];

const SUGGESTED_MODELS = {
  openai: ['gpt-4.1', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-sonnet-4-6', 'claude-opus-4-7', 'claude-haiku-4-5'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  openai_compatible: [],
};

export default function LLMConfig() {
  const { projectId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('openai');

  useEffect(() => {
    setLoading(true);
    client.get(`/projects/${projectId}/llm-config`)
      .then((resp) => {
        if (resp.data.provider) {
          form.setFieldsValue(resp.data);
          setSelectedProvider(resp.data.provider);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const normalizeValues = (values) => ({
    ...values,
    model: Array.isArray(values.model) ? values.model[0] : values.model,
  });

  const handleSave = async () => {
    const values = normalizeValues(await form.validateFields());
    setSaving(true);
    try {
      await client.put(`/projects/${projectId}/llm-config`, values);
      message.success('LLM configuration saved');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    const values = normalizeValues(await form.validateFields());
    setTesting(true);
    try {
      const resp = await client.post(`/projects/${projectId}/llm-config/test`, values);
      message.success(resp.data?.message || 'Connection test passed');
    } catch { /* */ }
    finally { setTesting(false); }
  };

  return (
    <div>
      <h1>LLM Configuration</h1>
      <Card loading={loading} style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical" initialValues={{ provider: 'openai', model: '', api_key: '', base_url: '', extra_params: '' }}>
          <Form.Item label="Provider" name="provider" rules={[{ required: true }]}>
            <Select options={PROVIDERS} onChange={(v) => setSelectedProvider(v)} />
          </Form.Item>
          <Form.Item label="Model" name="model" rules={[{ required: true, message: 'Model name is required' }]}>
            <Select
              mode="tags"
              maxCount={1}
              placeholder="Select or type model name"
              options={(SUGGESTED_MODELS[selectedProvider] || []).map((m) => ({ label: m, value: m }))}
            />
          </Form.Item>
          <Form.Item label="API Key" name="api_key" rules={[{ required: true, message: 'API key is required' }]}>
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          {(selectedProvider === 'openai_compatible' || selectedProvider === 'deepseek') && (
            <Form.Item label="Base URL" name="base_url">
              <Input placeholder={selectedProvider === 'deepseek' ? 'https://api.deepseek.com/v1' : 'https://your-api-endpoint/v1'} />
            </Form.Item>
          )}
          <Form.Item label="Extra Params (JSON)" name="extra_params">
            <Input.TextArea rows={2} placeholder='{"temperature": 0.3}' />
          </Form.Item>
          <Space>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
              Save
            </Button>
            <Button icon={<ThunderboltOutlined />} onClick={handleTest} loading={testing}>
              Test Connection
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
