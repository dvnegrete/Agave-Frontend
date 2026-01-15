import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@config/api';

export function ApiStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {

    const checkApi = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch {
        setStatus('offline');
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (status === 'checking') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm ${
          status === 'online'
            ? 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}
        ></span>
        <span className="font-medium">
          API: {status === 'online' ? 'Conectada' : 'Desconectada'}
        </span>
        {/* <span className="text-xs opacity-75">({apiUrl})</span> */}
      </div>
    </div>
  );
}
