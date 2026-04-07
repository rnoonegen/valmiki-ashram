import { useEffect, useState } from 'react';
import Container from '../components/Container';
import { adminRequest } from '../admin/api';
import ImageUploader from '../components/admin/ImageUploader';

export default function AdminGallery() {
  const [items, setItems] = useState([]);

  const load = () => {
    adminRequest('/api/admin/gallery-assets')
      .then((data) => setItems(data.items || []))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    await adminRequest(`/api/admin/media/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="heading-page">Admin: Gallery</h1>
        <ImageUploader folder="gallery" buttonText="Upload New" onUploaded={load} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item._id}
            className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
          >
            <img src={item.url} alt={item.originalName || 'Gallery'} className="aspect-[4/3] w-full object-cover" />
            <div className="flex items-center justify-between gap-2 p-3">
              <p className="line-clamp-1 text-xs text-prose-muted">{item.originalName || item.key}</p>
              <button
                type="button"
                onClick={() => remove(item._id)}
                className="rounded-md bg-rose-100 px-2 py-1 text-xs text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}
