// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InstructorDashboard from './components/ScenarioBrief/InstructorDashboard';
import StudentApp from './StudentApp';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="*" element={<StudentApp />} />
      </Routes>
    </Router>
  );
};

export default App;