import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export function Alert({ type = 'info', children }) {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertCircle
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle
    }
  };

  const { bg, border, text, icon: Icon } = styles[type];

  return (
    <div className={`${bg} ${border} border rounded-lg p-4 flex items-start space-x-3`}>
      <Icon className={text} size={20} />
      <div className={`${text} text-sm flex-1`}>{children}</div>
    </div>
  );
}