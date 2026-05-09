import React, { useEffect, useState } from 'react';
import { Select, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import client from '../api/client';

export default function ProjectSelector() {
  const [projects, setProjects] = useState([]);
  const { currentProject, selectProject } = useProject();
  const navigate = useNavigate();
  const { projectId } = useParams();

  useEffect(() => {
    client.get('/projects').then((resp) => {
      setProjects(resp.data);
    }).catch(() => {});
  }, []);

  const handleChange = (value) => {
    const project = projects.find((p) => p.id === value);
    if (project) {
      selectProject(project);
      navigate(`/projects/${project.id}/locales`);
    }
  };

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <Select
        value={projectId || undefined}
        onChange={handleChange}
        placeholder="Select project"
        style={{ width: '100%' }}
        options={projects.map((p) => ({ label: p.name, value: p.id }))}
      />
    </div>
  );
}
