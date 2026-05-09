import React, { createContext, useContext, useState, useCallback } from 'react';
import { setAuthHeaders } from '../api/client';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [currentProject, setCurrentProject] = useState(() => {
    const saved = sessionStorage.getItem('dictapp_current_project');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setAuthHeaders(p.id, p.api_key);
        return p;
      } catch { /* ignore */ }
    }
    return null;
  });

  const selectProject = useCallback((project) => {
    setCurrentProject(project);
    if (project) {
      sessionStorage.setItem('dictapp_current_project', JSON.stringify(project));
      setAuthHeaders(project.id, project.api_key);
    } else {
      sessionStorage.removeItem('dictapp_current_project');
      setAuthHeaders('', '');
    }
  }, []);

  return (
    <ProjectContext.Provider value={{ currentProject, selectProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
