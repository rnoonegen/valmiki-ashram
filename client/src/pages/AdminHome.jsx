import { useEffect, useState } from 'react';
import Container from '../components/Container';
import { adminRequest } from '../admin/api';
import ImageUploader from '../components/admin/ImageUploader';

const defaults = {
  heroTitle: 'Valmiki International Gurukulam Residential Family Admissions Open Now',
  heroSubtitle: "World's First Skill Based Technology Gurukulam",
  heroImage: '',
  introVideoUrl: '',
};

export default function AdminHome() {
  const [content, setContent] = useState(defaults);

  useEffect(() => {
    adminRequest('/api/admin/content/home')
      .then((data) => setContent((prev) => ({ ...prev, ...(data.content || {}) })))
      .catch(() => {});
  }, []);

  const save = async () => {
    await adminRequest('/api/admin/content/home', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    alert('Home content saved');
  };

  return (
    <Container className="py-8">
      <h1 className="heading-page">Admin: Home</h1>
      <div className="mt-6 space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <label className="block text-sm font-medium">Hero Title</label>
        <textarea
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          rows={3}
          value={content.heroTitle || ''}
          onChange={(e) => setContent((p) => ({ ...p, heroTitle: e.target.value }))}
        />
        <label className="block text-sm font-medium">Hero Subtitle</label>
        <input
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          value={content.heroSubtitle || ''}
          onChange={(e) => setContent((p) => ({ ...p, heroSubtitle: e.target.value }))}
        />
        <label className="block text-sm font-medium">Intro Video URL</label>
        <input
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          value={content.introVideoUrl || ''}
          onChange={(e) => setContent((p) => ({ ...p, introVideoUrl: e.target.value }))}
        />
        <div>
          <p className="mb-2 text-sm font-medium">Hero Image</p>
          <div className="group relative max-w-xl overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
            {content.heroImage ? (
              <img src={content.heroImage} alt="Hero" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-800" />
            )}
            <div className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex">
              <ImageUploader
                folder="home"
                buttonText="Change Image"
                onUploaded={(asset) => setContent((p) => ({ ...p, heroImage: asset.url }))}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          className="rounded-lg bg-accent px-4 py-2 text-white dark:bg-emerald-700"
        >
          Save Home
        </button>
      </div>
    </Container>
  );
}
