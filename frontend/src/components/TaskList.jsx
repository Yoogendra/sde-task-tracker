// frontend/src/components/TaskList.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import TaskForm from './TaskForm';
import DependencyGraph from './DependencyGraph'; // <--- Import Graph

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

    // Function to add a dependency
    const addDependency = async (taskId, dependsOnId) => {
        try {
            await api.post(`tasks/${taskId}/dependencies/`, {
                depends_on_id: dependsOnId
            });
            alert("Dependency added!");
            fetchTasks(); // Refresh to update graph and status
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add dependency");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: List & Form */}
            <div>
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Task Manager</h2>
                <TaskForm onTaskAdded={fetchTasks} />
                
                <div className="space-y-4 mt-6 h-96 overflow-y-auto pr-2">
                    {tasks.map((task) => (
                        <div key={task.id} className="p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-lg">#{task.id} {task.title}</span>
                                <span className={`px-2 py-1 text-xs rounded-full uppercase font-bold
                                    ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                      task.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {task.status}
                                </span>
                            </div>
                            
                            {/* Simple UI to add dependency */}
                            <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                                <select 
                                    className="text-sm border rounded p-1 w-full bg-slate-50"
                                    onChange={(e) => {
                                        if(e.target.value) addDependency(task.id, e.target.value);
                                        e.target.value = ""; // Reset dropdown
                                    }}
                                >
                                    <option value="">+ Add Dependency</option>
                                    {tasks.filter(t => t.id !== task.id).map(t => (
                                        <option key={t.id} value={t.id}>Dep on: #{t.id} {t.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: The Graph */}
            <div>
                 <DependencyGraph tasks={tasks} />
            </div>
        </div>
    );
};

export default TaskList;