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
            await api.post('tasks/', {
                title,
                description,
                status: 'pending' // Default status
            });
            
            // Clear form and notify parent
            setTitle('');
            setDescription('');
            if (onTaskAdded) onTaskAdded(); 
            
        } catch (error) {
            console.error("Failed to create task", error);
            alert("Error creating task");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h3 className="text-xl font-bold mb-4 text-slate-700">Add New Task</h3>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-1">Task Title</label>
                <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Design Database Schema"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="3"
                    placeholder="Optional details..."
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-2 px-4 rounded text-white font-semibold transition
                    ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                {loading ? 'Adding...' : 'Create Task'}
            </button>
        </form>
    );
};

export default TaskForm;