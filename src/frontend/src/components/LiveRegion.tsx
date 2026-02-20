import { useAnnouncer } from '../hooks/useAnnouncer';

export default function LiveRegion() {
  const { message, mode } = useAnnouncer();

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {mode === 'polite' ? message : ''}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {mode === 'assertive' ? message : ''}
      </div>
    </>
  );
}
