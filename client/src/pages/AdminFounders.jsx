import { useEffect, useState } from 'react';
import Container from '../components/Container';
import { adminRequest } from '../admin/api';
import ImageUploader from '../components/admin/ImageUploader';

const defaults = {
  rameshImage: '',
  swapnaImage: '',
};

export default function AdminFounders() {
  const [content, setContent] = useState(defaults);

  useEffect(() => {
    adminRequest('/api/admin/content/founders')
      .then((data) => setContent((prev) => ({ ...prev, ...(data.content || {}) })))
      .catch(() => {});
  }, []);

  const save = async () => {
    await adminRequest('/api/admin/content/founders', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    alert('Founders content saved');
  };

  return (
    <Container className="py-8">
      <h1 className="heading-page">Admin: Founders</h1>
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <ImageUploader
              folder="founders"
              buttonText="Upload Ramesh Photo"
              onUploaded={(asset) => setContent((p) => ({ ...p, rameshImage: asset.url }))}
            />
            {content.rameshImage ? (
              <img src={content.rameshImage} alt="Ramesh" className="mt-3 rounded-xl" />
            ) : null}
          </div>
          <div>
            <ImageUploader
              folder="founders"
              buttonText="Upload Swapna Photo"
              onUploaded={(asset) => setContent((p) => ({ ...p, swapnaImage: asset.url }))}
            />
            {content.swapnaImage ? (
              <img src={content.swapnaImage} alt="Swapna" className="mt-3 rounded-xl" />
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          className="mt-5 rounded-lg bg-accent px-4 py-2 text-white dark:bg-emerald-700"
        >
          Save Founders
        </button>
      </div>
    </Container>
  );
}
