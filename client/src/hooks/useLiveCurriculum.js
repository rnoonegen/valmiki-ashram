import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { apiRequest, getApiBase } from '../admin/api';
import { defaultCurriculum } from '../data/defaultCurriculum';

const socket = io(getApiBase(), { autoConnect: true });

export default function useLiveCurriculum() {
  const [categories, setCategories] = useState(defaultCurriculum);

  useEffect(() => {
    let mounted = true;
    apiRequest('/api/curriculum')
      .then((data) => {
        if (mounted && Array.isArray(data?.categories) && data.categories.length) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});

    const onUpdate = (payload) => {
      if (Array.isArray(payload?.categories)) {
        setCategories(payload.categories);
      }
    };
    socket.on('curriculum:updated', onUpdate);
    return () => {
      mounted = false;
      socket.off('curriculum:updated', onUpdate);
    };
  }, []);

  return categories;
}
