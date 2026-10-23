import LoadingState from './LoadingState.jsx';
import ErrorState from './ErrorState.jsx';

// Renders the right state for a useAsync result; children receive the loaded data.
export default function DataLoader({ result, rows = 3, children }) {
  if (result.status === 'loading' && !result.data) return <LoadingState rows={rows} />;
  if (result.status === 'error') return <ErrorState error={result.error} onRetry={result.reload} />;
  return children(result.data);
}
