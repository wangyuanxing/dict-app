import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider } from './contexts/ProjectContext';
import AppLayout from './components/Layout';
import ProjectList from './pages/ProjectList';
import LocaleManager from './pages/LocaleManager';
import TranslationTasks from './pages/TranslationTasks';
import TaskDetail from './pages/TaskDetail';
import LLMConfig from './pages/LLMConfig';

export default function App() {
  return (
    <ProjectProvider>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:projectId/locales" element={<LocaleManager />} />
          <Route path="projects/:projectId/tasks" element={<TranslationTasks />} />
          <Route path="projects/:projectId/tasks/:taskId" element={<TaskDetail />} />
          <Route path="projects/:projectId/llm" element={<LLMConfig />} />
        </Route>
      </Routes>
    </ProjectProvider>
  );
}
