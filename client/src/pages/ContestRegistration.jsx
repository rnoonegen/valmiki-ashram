import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Container from '../components/Container';
import PageFade from '../components/PageFade';
import { apiRequest } from '../admin/api';
import { resolveBuiltInRegistrationIntro } from '../constants/contestRegistrationDefaults';

const platformOptions = ['YouTube', 'Instagram', 'X (Twitter)', 'Facebook', 'Other'];

export default function ContestRegistration() {
  const { contestId } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    watchedRulesVideo: false,
    joinedArattaiCommunity: false,
    shortVideoLink: '',
    socialPlatforms: [],
    strategySummary: '',
  });

  useEffect(() => {
    if (!contestId) return;
    setLoading(true);
    apiRequest(`/api/contests/${contestId}`)
      .then((data) => setContest(data.contest || null))
      .catch((err) => setError(err.message || 'Unable to load contest'))
      .finally(() => setLoading(false));
  }, [contestId]);

  const useGoogle = useMemo(() => contest?.registerMode === 'google', [contest]);

  const registrationOpen = contest?.registrationOpen !== false;

  const googleFormButtonLabel = useMemo(() => {
    const raw = String(contest?.googleFormButtonLabel || '').trim();
    return raw || 'Register Now';
  }, [contest?.googleFormButtonLabel]);

  const builtInIntro = useMemo(
    () => (contest ? resolveBuiltInRegistrationIntro(contest.builtInRegistrationIntro) : ''),
    [contest]
  );

  const togglePlatform = (value) => {
    setForm((prev) => {
      const exists = prev.socialPlatforms.includes(value);
      return {
        ...prev,
        socialPlatforms: exists
          ? prev.socialPlatforms.filter((item) => item !== value)
          : [...prev.socialPlatforms, value],
      };
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await apiRequest(`/api/contests/${contestId}/register`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage(data.message || 'Registration submitted.');
      setForm({
        fullName: '',
        email: '',
        mobileNumber: '',
        watchedRulesVideo: false,
        joinedArattaiCommunity: false,
        shortVideoLink: '',
        socialPlatforms: [],
        strategySummary: '',
      });
    } catch (err) {
      setError(err.message || 'Unable to submit registration');
    }
  };

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        {loading ? <p className="text-prose-muted">Loading registration form...</p> : null}
        {!loading && error ? <p className="text-rose-600 dark:text-rose-400">{error}</p> : null}
        {!loading && contest ? (
          <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h1 className="heading-page border-b border-neutral-200 pb-5 dark:border-neutral-700">{contest.title}</h1>
            {!registrationOpen ? (
              <p className="mt-6 text-sm font-medium text-amber-800 dark:text-amber-200">
                Registration is closed for this contest. You cannot submit a form at this time.
              </p>
            ) : useGoogle ? (
              <div className="mt-6 space-y-3">
                {contest.googleFormHelperText ? (
                  <p className="whitespace-pre-wrap text-sm text-prose-muted">{contest.googleFormHelperText}</p>
                ) : (
                  <p className="text-prose">This contest uses Google Form registration.</p>
                )}
                {contest.googleFormUrl ? (
                  <a
                    href={contest.googleFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg bg-accent px-4 py-2 text-white hover:opacity-90 dark:bg-emerald-700"
                  >
                    {googleFormButtonLabel}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    The Google Form link has not been configured yet. Please check back later.
                  </p>
                )}
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <div className="mb-6 whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 text-sm leading-relaxed text-prose dark:border-neutral-600 dark:bg-neutral-950/40 dark:text-neutral-200">
                  {builtInIntro}
                </div>
                <input
                  required
                  placeholder="Full Name"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
                <input
                  required
                  placeholder="Mobile Number"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                  value={form.mobileNumber}
                  onChange={(e) => setForm((p) => ({ ...p, mobileNumber: e.target.value }))}
                />
                <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                  <input
                    type="checkbox"
                    className="mr-2 accent-accent dark:accent-emerald-500"
                    checked={form.watchedRulesVideo}
                    onChange={(e) => setForm((p) => ({ ...p, watchedRulesVideo: e.target.checked }))}
                  />
                  Have you watched the official contest rules video?
                </label>
                <label className="block text-sm text-neutral-800 dark:text-neutral-200">
                  <input
                    type="checkbox"
                    className="mr-2 accent-accent dark:accent-emerald-500"
                    checked={form.joinedArattaiCommunity}
                    onChange={(e) => setForm((p) => ({ ...p, joinedArattaiCommunity: e.target.checked }))}
                  />
                  Have you joined the Arattai App community?
                </label>
                <input
                  required
                  placeholder="Short video link"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                  value={form.shortVideoLink}
                  onChange={(e) => setForm((p) => ({ ...p, shortVideoLink: e.target.value }))}
                />
                <div>
                  <p className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">Social media platforms</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {platformOptions.map((item) => (
                      <label key={item} className="text-sm text-neutral-800 dark:text-neutral-200">
                        <input
                          type="checkbox"
                          className="mr-2 accent-accent dark:accent-emerald-500"
                          checked={form.socialPlatforms.includes(item)}
                          onChange={() => togglePlatform(item)}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Brief summary of your strategy"
                  rows={5}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:[color-scheme:dark]"
                  value={form.strategySummary}
                  onChange={(e) => setForm((p) => ({ ...p, strategySummary: e.target.value }))}
                />
                {message ? (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
                ) : null}
                {error ? <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-white hover:opacity-90 dark:bg-emerald-700"
                >
                  Submit
                </button>
              </form>
            )}
          </div>
        ) : null}
      </Container>
    </PageFade>
  );
}
