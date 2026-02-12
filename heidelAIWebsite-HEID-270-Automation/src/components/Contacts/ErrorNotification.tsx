interface ErrorNotificationProps {
    message: string;
    onDismiss: () => void;
  }
  
  export const ErrorNotification = ({ message, onDismiss }: ErrorNotificationProps) => (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="h-5 w-5 text-red-400">!</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="text-red-700 hover:text-red-500"
            >
              <span className="sr-only">Dismiss</span>
              &times;
            </button>
          </div>
        </div>
      </div>
    </div>
  );