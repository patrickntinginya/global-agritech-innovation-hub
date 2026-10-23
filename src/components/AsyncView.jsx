import LoadingState from './LoadingState.jsx';
import ErrorState from './ErrorState.jsx';

// Renders loading / error states for a useAsync() result, otherwise calls children(data).
export default function AsyncView({ state, children, rows = 3 }) {
  if (state.status === 'loading' && !state.data) return <LoadingState rows={rows} />;
  if (state.status === 'error') return <ErrorState onRetry={state.retry} />;
  return children(state.data);
}
