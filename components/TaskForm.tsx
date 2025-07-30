import { useState, useEffect } from 'react';
import { Task, CreateTaskData, UpdateTaskData } from '@/types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTaskData | UpdateTaskData) => void;
  task?: Task | null;
  mode: 'create' | 'edit';
}

export default function TaskForm({ isOpen, onClose, onSave, task, mode }: TaskFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && task) {
        setName(task.name);
        setDescription(task.description || '');
      } else {
        setName('');
        setDescription('');
      }
    }
  }, [isOpen, mode, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Task name is required');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task name"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {mode === 'create' ? 'Create Task' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}