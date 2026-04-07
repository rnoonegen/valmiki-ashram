import { useEffect, useState } from 'react';
import Container from '../components/Container';
import { adminRequest } from '../admin/api';
import ImageUploader from '../components/admin/ImageUploader';

const defaults = {
  founderImage1: '',
  founderImage2: '',
};

export default function AdminAbout() {
  const [content, setContent] = useState(defaults);

  useEffect(() => {
    adminRequest('/api/admin/content/about')
      .then((data) => setContent((prev) => ({ ...prev, ...(data.content || {}) })))
      .catch(() => {});
  }, []);

  const save = async () => {
    await adminRequest('/api/admin/content/about', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    alert('About content saved');
  };

  return (
    <Container className="py-8">
      <h1 className="heading-page">Admin: About</h1>
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <p className="mb-4 text-sm text-prose-muted">Change founders photos used in About page.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <ImageUploader
              folder="about"
              buttonText="Upload Founder 1"
              onUploaded={(asset) => setContent((p) => ({ ...p, founderImage1: asset.url }))}
            />
            {content.founderImage1 ? (
              <img src={content.founderImage1} alt="Founder one" className="mt-3 rounded-xl" />
            ) : null}
          </div>
          <div>
            <ImageUploader
              folder="about"
              buttonText="Upload Founder 2"
              onUploaded={(asset) => setContent((p) => ({ ...p, founderImage2: asset.url }))}
            />
            {content.founderImage2 ? (
              <img src={content.founderImage2} alt="Founder two" className="mt-3 rounded-xl" />
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          className="mt-5 rounded-lg bg-accent px-4 py-2 text-white dark:bg-emerald-700"
        >
          Save About
        </button>
      </div>
    </Container>
  );
}
