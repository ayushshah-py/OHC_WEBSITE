import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AlertMessages: React.FC = () => {
  const { alerts, removeAlert } = useAuth();

  if (alerts.length === 0) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <AlertCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      case 'info': return <Info size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`${getAlertStyles(alert.type)} border rounded-lg p-4 shadow-lg max-w-sm animate-slide-in`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{alert.message}</p>
            </div>
            <button
              onClick={() => removeAlert(alert.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertMessages;