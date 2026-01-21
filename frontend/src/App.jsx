// frontend/src/App.jsx
import React from 'react';
import TaskList from './components/TaskList';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
          Task Dependency Manager
        </h1>
      </header>
      
      <main>
        <TaskList />
      </main>
    </div>
  );
}

export default App;