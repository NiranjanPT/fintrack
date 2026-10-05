export default function Loading({ message = 'Loading...', fullScreen = false }) {
  return (
    <div className={`loading ${fullScreen ? 'loading-full' : ''}`} role="status">
      <span className="spinner" />
      <span>{message}</span>
    </div>
  );
}
