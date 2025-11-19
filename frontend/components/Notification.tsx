interface NotificationProps {
  message: string;
}

export default function Notification({ message }: NotificationProps) {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto max-w-sm z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg animate-fade-in text-sm sm:text-base">
      {message}
    </div>
  );
}
