import { useEffect, useState } from 'react';
import Container from '../components/Container';
import { adminRequest } from '../admin/api';

export default function AdminFaq() {
  const [payload, setPayload] = useState('[]');

  useEffect(() => {
    adminRequest('/api/admin/content/faq')
      .then((data) => setPayload(JSON.stringify(data.content?.faqCategories || [], null, 2)))
      .catch(() => {});
  }, []);

  const save = async () => {
    let parsed = [];
    try {
      parsed = JSON.parse(payload);
    } catch (error) {
      alert('Invalid JSON');
      return;
    }
    await adminRequest('/api/admin/content/faq', {
      method: 'PUT',
      body: JSON.stringify({ content: { faqCategories: parsed } }),
    });
    alert('FAQ saved');
  };

  return (
    <Container className="py-8">
      <h1 className="heading-page">Admin: FAQ</h1>
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <p className="mb-3 text-sm text-prose-muted">
          Edit FAQ categories in JSON format. Keep the current structure.
        </p>
        <textarea
          className="h-[420px] w-full rounded-xl border border-neutral-300 p-3 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-950"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
        />
        <button
          type="button"
          onClick={save}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-white dark:bg-emerald-700"
        >
          Save FAQ
        </button>
      </div>
    </Container>
  );
}
