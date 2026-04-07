import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { apiRequest, getApiBase } from '../admin/api';

const socket = io(getApiBase(), { autoConnect: true });

export default function useLiveGallery() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = () =>
      apiRequest('/api/content/gallery/assets/all')
        .then((data) => {
          if (mounted) {
            setItems(data?.items || []);
          }
        })
        .catch(() => {});

    load();
    socket.on('media:uploaded', load);
    socket.on('media:deleted', load);

    return () => {
      mounted = false;
      socket.off('media:uploaded', load);
      socket.off('media:deleted', load);
    };
  }, []);

  return items;
}
