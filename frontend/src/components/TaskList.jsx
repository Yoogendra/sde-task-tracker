// frontend/src/components/TaskList.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import TaskForm from './TaskForm';
import DependencyGraph from './DependencyGraph';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const res = await api.get('tasks/');
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    // Add Dependency
    const addDependency = async (taskId, dependsOnId) => {
        try {
            await api.post(`tasks/${taskId}/dependencies/`, { depends_on_id: dependsOnId });
            fetchTasks(); // Refresh to see status updates
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add dependency");
        }
    };

    // Update Status (e.g., Mark as Completed)
    const updateStatus = async (taskId, newStatus) => {
        try {
            await api.patch(`tasks/${taskId}/`, { status: newStatus });
            fetchTasks();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    // Delete Task
    const deleteTask = async (task) => {
        const dependents = tasks.filter(t => 
            t.dependencies.some(d => d.depends_on === task.id)
        );

        if (dependents.length > 0) {
            const confirmDelete = window.confirm(
                `⚠️ Warning: The following tasks depend on "${task.title}":\n` +
                dependents.map(t => `- ${t.title}`).join('\n') +
                `\n\nDeleting this will break those dependencies. Continue?`
            );
            if (!confirmDelete) return;
        } else {
            if (!window.confirm("Are you sure you want to delete this task?")) return;
        }

        try {
            await api.delete(`tasks/${task.id}/`);
            fetchTasks();
        } catch (err) {
            alert("Failed to delete task");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64 text-slate-400">
            <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Task List (5/12) */}
            <div className="lg:col-span-5 space-y-6">
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                        <h2 className="font-semibold text-slate-700">Create New Task</h2>
                    </div>
                    <div className="p-6">
                        <TaskForm onTaskAdded={fetchTasks} />
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h2 className="text-lg font-bold text-slate-800">Your Tasks</h2>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-200 rounded-full text-slate-600">
                            {tasks.length} Total
                        </span>
                    </div>
                    
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {tasks.map((task) => (
                            <div key={task.id} className="group bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all relative">
                                
                                {/* Header: Title + Status Dropdown */}
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800 truncate pr-2 w-full" title={task.title}>
                                        {task.title}
                                    </h3>
                                    
                                    {/* Status Changer */}
                                    <select 
                                        value={task.status}
                                        onChange={(e) => updateStatus(task.id, e.target.value)}
                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border-none focus:ring-0 cursor-pointer
                                            ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                                              task.status === 'blocked' ? 'bg-rose-100 text-rose-700' : 
                                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                              'bg-slate-100 text-slate-600'}`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        {task.status === 'blocked' && <option value="blocked" disabled>Blocked</option>}
                                    </select>
                                </div>

                                <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[20px]">
                                    {task.description || "No description provided."}
                                </p>

                                {/* Action Bar */}
                                <div className="pt-3 border-t border-slate-50 flex items-center gap-2">
                                    <div className="flex-1">
                                        <select 
                                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            onChange={(e) => {
                                                if(e.target.value) addDependency(task.id, e.target.value);
                                                e.target.value = "";
                                            }}
                                        >
                                            <option value="">+ Add Dependency...</option>
                                            {tasks.filter(t => t.id !== task.id).map(t => (
                                                <option key={t.id} value={t.id}>
                                                    Link to: {t.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <button 
                                        onClick={() => deleteTask(task)}
                                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-md transition-colors"
                                        title="Delete Task"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* RIGHT COLUMN: Graph (7/12) */}
            <div className="lg:col-span-7 sticky top-24 h-fit">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                    
                    {/* --- CHANGED HERE: Fixed height (h-[600px]) for Zoom/Pan --- */}
                    <div className="bg-slate-900 rounded-lg overflow-hidden relative h-[600px] touch-none">
                         
                         <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur px-3 py-1 rounded-full border border-slate-700">
                            <span className="text-xs text-slate-300 font-medium flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Graph
                            </span>
                         </div>
                         
                         <DependencyGraph tasks={tasks} />

                         {/* --- NEW: Zoom/Pan Instructions --- */}
                         <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-slate-800/80 px-2 py-1 rounded pointer-events-none select-none">
                            Scroll to Zoom • Drag to Pan • Click to Focus
                         </div>

                    </div>
                    
                    {/* Legend */}
                    <div className="p-4 bg-white flex flex-wrap justify-between items-center text-xs text-slate-500 gap-4">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-300"></span> Pending</div>
                            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-200"></span> In Progress</div>
                            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-200"></span> Completed</div>
                            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-200"></span> Blocked</div>
                        </div>
                        <div>Auto-arranges circularly</div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TaskList;