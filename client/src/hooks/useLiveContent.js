import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { apiRequest, getApiBase } from '../admin/api';

const socket = io(getApiBase(), { autoConnect: true });

export default function useLiveContent(page, fallbackContent = {}) {
  const [content, setContent] = useState(fallbackContent);

  useEffect(() => {
    let mounted = true;
    apiRequest(`/api/content/${page}`)
      .then((data) => {
        if (mounted && data?.content) {
          setContent((prev) => ({ ...prev, ...data.content }));
        }
      })
      .catch(() => {});

    const onUpdated = (payload) => {
      if (payload?.page === page) {
        setContent((prev) => ({ ...prev, ...(payload.content || {}) }));
      }
    };

    socket.on('content:updated', onUpdated);
    return () => {
      mounted = false;
      socket.off('content:updated', onUpdated);
    };
  }, [page]);

  return useMemo(() => content, [content]);
}
