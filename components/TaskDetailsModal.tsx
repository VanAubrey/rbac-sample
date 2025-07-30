import { Task } from '@/types';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function TaskDetailsModal({ isOpen, onClose, task }: TaskDetailsModalProps) {
  if (!isOpen || !task) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.name}</h2>
            <p className="text-sm text-gray-500">Task ID: {task.uuid}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Progress Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {getProgressStatus(task.progress)}
              </span>
              <span className="text-sm font-bold text-gray-900">{task.progress}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-300 ${getProgressColor(task.progress)}`}
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Progress milestones */}
          <div className="grid grid-cols-5 gap-2 text-xs text-gray-600">
            <div className={`text-center ${task.progress >= 0 ? 'font-semibold' : ''}`}>
              0%<br />Start
            </div>
            <div className={`text-center ${task.progress >= 25 ? 'font-semibold' : ''}`}>
              25%<br />Quarter
            </div>
            <div className={`text-center ${task.progress >= 50 ? 'font-semibold' : ''}`}>
              50%<br />Half
            </div>
            <div className={`text-center ${task.progress >= 75 ? 'font-semibold' : ''}`}>
              75%<br />Three-quarters
            </div>
            <div className={`text-center ${task.progress >= 100 ? 'font-semibold' : ''}`}>
              100%<br />Complete
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            {task.description ? (
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            ) : (
              <p className="text-gray-500 italic">No description provided</p>
            )}
          </div>
        </div>

        {/* Task Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Task Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-1">Created By</h4>
              <p className="text-gray-600">{task.userId}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-1">Task Status</h4>
              <p className="text-gray-600">{getProgressStatus(task.progress)}</p>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">Created</p>
                <p className="text-sm text-gray-600">{formatDate(task.created_at)}</p>
              </div>
            </div>
            
            {task.updated_at && task.updated_at !== task.created_at && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Updated</p>
                  <p className="text-sm text-gray-600">{formatDate(task.updated_at)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}