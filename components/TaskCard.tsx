import { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{task.name}</h3>
        <div className="flex space-x-2 ml-2">
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
      
      <div className="text-xs text-gray-500">
        <p>Created: {formatDate(task.created_at)}</p>
        {task.updated_at && task.updated_at !== task.created_at && (
          <p>Updated: {formatDate(task.updated_at)}</p>
        )}
      </div>
    </div>
  );
}