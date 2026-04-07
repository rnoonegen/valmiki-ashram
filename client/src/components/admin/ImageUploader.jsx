import { useRef, useState } from 'react';
import { getAdminToken, getApiBase } from '../../admin/api';

export default function ImageUploader({ folder, onUploaded, buttonText = 'Upload Image' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    try {
      setUploading(true);
      const res = await fetch(`${getApiBase()}/api/admin/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAdminToken()}` },
        body: formData,
      });
      if (!res.ok) {
        let message = 'Upload failed';
        try {
          const body = await res.json();
          message = body?.message || message;
        } catch (error) {
          // no-op
        }
        throw new Error(message);
      }
      const data = await res.json();
      onUploaded?.(data);
    } catch (error) {
      alert(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg bg-accent px-3 py-2 text-sm text-white disabled:opacity-70 dark:bg-emerald-700"
      >
        {uploading ? 'Uploading...' : buttonText}
      </button>
    </div>
  );
}
