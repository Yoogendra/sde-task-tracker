// frontend/src/components/TaskForm.jsx
import React, { useState } from 'react';
import api from '../api';

const TaskForm = ({ onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            await api.post('tasks/', { title, description, status: 'pending' });
            setTitle('');
            setDescription('');
            if (onTaskAdded) onTaskAdded(); 
        } catch (error) {
            console.error(error);
            alert("Error creating task");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Task Title</label>
                <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="e.g. Design Database Schema"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                    rows="3"
                    placeholder="Briefly describe the task..."
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-lg text-white text-sm font-semibold shadow-sm transition-all flex justify-center items-center gap-2
                    ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow active:transform active:scale-95'}`}
            >
                {loading ? (
                   <span>Adding...</span>
                ) : (
                   <>
                     <span>+ Create Task</span>
                   </>
                )}
            </button>
        </form>
    );
};

export default TaskForm;