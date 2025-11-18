interface NotificationProps {
  message: string;
}

export default function Notification({ message }: NotificationProps) {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg animate-fade-in">
      {message}
    </div>
  );
}
