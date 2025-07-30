import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from 'react';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { Task, CreateTaskData, UpdateTaskData } from '@/types';

export default function Home() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch tasks
  const fetchTasks = async () => {
    if (!session) return;
    
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const tasksData = await response.json();
        setTasks(tasksData);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Create task
  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [newTask, ...prev]);
      } else {
        alert('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task');
    }
  };

  // Update task
  const handleUpdateTask = async (data: UpdateTaskData) => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(task => 
          task.id === selectedTask.id ? updatedTask : task
        ));
      } else {
        alert('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
      } else {
        alert('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task');
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = (data: CreateTaskData | UpdateTaskData) => {
    if (modalMode === 'create') {
      // Using type assertion since we know the data will be CreateTaskData in create mode
      handleCreateTask(data as CreateTaskData);
    } else {
      handleUpdateTask(data);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="mb-4 text-gray-700">You are not signed in</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => signIn("google")}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session.user?.name}</span>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => signOut()}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Task Button */}
        <div className="mb-6">
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
          >
            + Create New Task
          </button>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex justify-center">
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tasks yet</p>
            <p className="text-gray-400">Create your first task to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveTask}
        task={selectedTask}
        mode={modalMode}
      />
    </div>
  );
}