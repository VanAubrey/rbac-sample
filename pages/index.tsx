import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Users } from 'lucide-react'; // Make sure you have lucide-react installed
import TaskCard from '../components/TaskCard';
import TaskForm from "@/components/TaskForm";
import { Task, CreateTaskData, UpdateTaskData } from '@/types';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.id) {
        setAdminCheckLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/teams');
        if (response.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setAdminCheckLoading(false);
      }
    };

    if (session) {
      checkAdminStatus();
    } else {
      setAdminCheckLoading(false);
    }
  }, [session]);

  // Check if we should open edit modal from URL params
  useEffect(() => {
    if (router.query.edit && tasks.length > 0) {
      const taskId = parseInt(router.query.edit as string);
      const taskToEdit = tasks.find(task => task.id === taskId);
      if (taskToEdit) {
        openEditModal(taskToEdit);
        // Clean up URL
        router.replace('/', undefined, { shallow: true });
      }
    }
  }, [router.query.edit, tasks]);

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
      handleCreateTask(data as CreateTaskData);
    } else {
      handleUpdateTask(data as UpdateTaskData);
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
            {/* Left side - Logo/Title and Navigation */}
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
              
              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    router.pathname === '/'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Tasks
                </Link>
                
                {/* Team Management Link - Only visible to admins */}
                {isAdmin && (
                  <Link
                    href="/team-management"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                      router.pathname === '/team-management'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Users size={16} />
                    <span>Team Management</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Right side - User Info and Sign Out */}
            <div className="flex items-center space-x-4">
              {/* Admin Badge */}
              {isAdmin && !adminCheckLoading && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  Admin
                </span>
              )}
              
              <span className="text-gray-700 hidden sm:inline">
                Welcome, {session.user?.name}
              </span>
              
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                onClick={() => signOut()}
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4">
            <nav className="flex space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  router.pathname === '/'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Tasks
              </Link>
              
              {/* Team Management Link - Mobile */}
              {isAdmin && (
                <Link
                  href="/team-management"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                    router.pathname === '/team-management'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Users size={16} />
                  <span>Teams</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Task Button */}
        <div className="mb-6">
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
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

      {/* Task Form Modal */}
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