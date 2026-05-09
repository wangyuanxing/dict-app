import React from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import { TranslationOutlined, ProjectOutlined, SettingOutlined, ThunderboltOutlined } from '@ant-design/icons';
import ProjectSelector from './ProjectSelector';
import { useProject } from '../contexts/ProjectContext';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const { currentProject } = useProject();

  const isProjectSelected = !!projectId && !!currentProject;

  const menuItems = [
    { key: 'locales', icon: <TranslationOutlined />, label: 'Locales' },
    { key: 'tasks', icon: <ThunderboltOutlined />, label: 'Translation Tasks' },
    { key: 'llm', icon: <SettingOutlined />, label: 'LLM Config' },
  ];

  const handleMenuClick = ({ key }) => {
    if (projectId) {
      navigate(`/projects/${projectId}/${key}`);
    }
  };

  const selectedKey = location.pathname.split('/').pop();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark">
        <div className="logo">Dict-App</div>
        <ProjectSelector />
        {isProjectSelected && (
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            items={menuItems}
          />
        )}
      </Sider>
      <Layout>
        <Content style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
