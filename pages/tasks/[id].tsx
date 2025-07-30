import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Task } from '@/types';

export default function TaskDetailsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch individual task
  const fetchTask = async () => {
    if (!session || !id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${id}`);
      
      if (response.ok) {
        const taskData = await response.json();
        setTask(taskData);
      } else if (response.status === 404) {
        setError('Task not found');
      } else {
        setError('Failed to fetch task');
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setError('Error fetching task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && id) {
      fetchTask();
    } else if (!session) {
      setLoading(false);
    }
  }, [session, id]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressStatus = (progress: number) => {
    if (progress === 0) return 'Not Started';
    if (progress === 100) return 'Completed';
    if (progress >= 80) return 'Nearly Complete';
    if (progress >= 40) return 'In Progress';
    return 'Just Started';
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="mb-4 text-gray-700">You are not signed in</p>
          <Link 
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Loading task...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Task not found'}
            </h1>
            <Link 
              href="/"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Back to Tasks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Tasks
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Task Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{task.name}</h2>
            <p className="text-sm text-gray-500">Task ID: {task.uuid}</p>
          </div>

          {/* Progress Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Progress</h3>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-medium text-gray-700">
                  {getProgressStatus(task.progress)}
                </span>
                <span className="text-lg font-bold text-gray-900">{task.progress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className={`h-6 rounded-full transition-all duration-300 ${getProgressColor(task.progress)}`}
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Progress milestones */}
            <div className="grid grid-cols-5 gap-4 text-sm text-gray-600">
              <div className={`text-center p-2 rounded ${task.progress >= 0 ? 'bg-white font-semibold' : ''}`}>
                0%<br />Start
              </div>
              <div className={`text-center p-2 rounded ${task.progress >= 25 ? 'bg-white font-semibold' : ''}`}>
                25%<br />Quarter
              </div>
              <div className={`text-center p-2 rounded ${task.progress >= 50 ? 'bg-white font-semibold' : ''}`}>
                50%<br />Half
              </div>
              <div className={`text-center p-2 rounded ${task.progress >= 75 ? 'bg-white font-semibold' : ''}`}>
                75%<br />Three-quarters
              </div>
              <div className={`text-center p-2 rounded ${task.progress >= 100 ? 'bg-white font-semibold' : ''}`}>
                100%<br />Complete
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
            <div className="p-6 bg-gray-50 rounded-lg">
              {task.description ? (
                <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
                  {task.description}
                </p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>
          </div>

          {/* Task Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Task Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Created By</h4>
                <p className="text-gray-600">{task.userId}</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Task Status</h4>
                <p className="text-gray-600">{getProgressStatus(task.progress)}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-700">Created</p>
                  <p className="text-gray-600">{formatDate(task.created_at)}</p>
                </div>
              </div>
              
              {task.updated_at && task.updated_at !== task.created_at && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-700">Last Updated</p>
                    <p className="text-gray-600">{formatDate(task.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Link 
              href="/"
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 font-medium"
            >
              Back to Tasks
            </Link>
            
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/?edit=${task.id}`)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Edit Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}