// frontend/src/App.jsx
import React from 'react';
import TaskList from './components/TaskList';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <h1 className="text-xl font-bold text-slate-800">TaskFlow</h1>
          </div>
          <span className="text-sm text-slate-500">SDE Intern Assignment</span>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="py-8">
        <TaskList />
      </main>
    </div>
  );
}

export default App;