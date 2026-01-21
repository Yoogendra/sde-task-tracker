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
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    const addDependency = async (taskId, dependsOnId) => {
        try {
            await api.post(`tasks/${taskId}/dependencies/`, { depends_on_id: dependsOnId });
            alert("Dependency added!");
            fetchTasks();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add dependency");
        }
    };

    // <--- NEW: Delete Logic
    const deleteTask = async (task) => {
        // Check if other tasks depend on this one
        const dependents = tasks.filter(t => 
            t.dependencies.some(d => d.depends_on === task.id)
        );

        if (dependents.length > 0) {
            const confirmDelete = window.confirm(
                `Warning: The following tasks depend on this task:\n` +
                dependents.map(t => `- ${t.title}`).join('\n') +
                `\n\nDeleting this will remove those dependencies. Continue?`
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

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Task Manager</h2>
                <TaskForm onTaskAdded={fetchTasks} />
                
                <div className="space-y-4 mt-6 h-[500px] overflow-y-auto pr-2">
                    {tasks.map((task) => (
                        <div key={task.id} className="p-4 bg-white rounded-lg shadow-sm border border-slate-200 relative group">
                            {/* Delete Button (Visible on Hover) */}
                            <button 
                                onClick={() => deleteTask(task)}
                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 font-bold px-2 text-xl"
                                title="Delete Task"
                            >
                                &times;
                            </button>

                            <div className="flex justify-between items-center mb-2 pr-6">
                                <span className="font-bold text-lg text-slate-700">#{task.id} {task.title}</span>
                                <span className={`px-2 py-1 text-xs rounded-full uppercase font-bold tracking-wide
                                    ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                      task.status === 'blocked' ? 'bg-red-100 text-red-700' : 
                                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                      'bg-slate-100 text-slate-600'}`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mb-3">{task.description}</p>
                            
                            <div className="pt-3 border-t border-slate-50 flex gap-2">
                                <select 
                                    className="text-sm border border-slate-200 rounded p-1.5 w-full bg-slate-50 focus:ring-2 focus:ring-blue-100 outline-none"
                                    onChange={(e) => {
                                        if(e.target.value) addDependency(task.id, e.target.value);
                                        e.target.value = "";
                                    }}
                                >
                                    <option value="">+ Add Dependency</option>
                                    {/* Prevent self-dependency in dropdown */}
                                    {tasks.filter(t => t.id !== task.id).map(t => (
                                        <option key={t.id} value={t.id}>Depends on: #{t.id} {t.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="sticky top-6">
                 <DependencyGraph tasks={tasks} />
            </div>
        </div>
    );
};

export default TaskList;