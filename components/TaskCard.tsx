import { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onViewDetails: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onViewDetails }: TaskCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{task.name}</h3>
        <div className="flex space-x-2 ml-2">
          <button
            onClick={() => onViewDetails(task)}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={() => onEdit(task)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{task.description}</p>
      )}

      {/* Progress indicator */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">Progress</span>
          <span className="text-xs text-gray-600">{task.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getProgressColor(task.progress)}`}
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>Created: {formatDate(task.created_at)}</p>
        {task.updated_at && task.updated_at !== task.created_at && (
          <p>Updated: {formatDate(task.updated_at)}</p>
        )}
      </div>
    </div>
  );
}