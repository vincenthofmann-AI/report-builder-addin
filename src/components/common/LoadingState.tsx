/**
 * Loading State Component
 * Displays loading spinner with optional message
 */


interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export function LoadingState({
  message = 'Loading...',
  size = 'medium'
}: LoadingStateProps) {
  return (
    <div className={`loading-state loading-state--${size}`}>
      <div className="loading-state__spinner">
        <div className="spinner"></div>
      </div>
      {message && <p className="loading-state__message">{message}</p>}
    </div>
  );
}
