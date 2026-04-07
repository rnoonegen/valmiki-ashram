import Container from '../components/Container';
import PageFade from '../components/PageFade';

export default function ContactUs() {
  const email = process.env.REACT_APP_EMAIL;
  const phone = process.env.REACT_APP_PHONE;
  const address = process.env.REACT_APP_ADDRESS;
  const maps = process.env.REACT_APP_GOOGLE_MAPS_LINK;
  const embedFromEnv = process.env.REACT_APP_GOOGLE_MAPS_EMBED_URL?.trim();

  const embedUrl =
    embedFromEnv ||
    (address
      ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
      : null);

  const digits = (phone || '').replace(/\D/g, '');
  const telHref =
    digits.length > 0
      ? digits.startsWith('91')
        ? `+${digits}`
        : `+91${digits}`
      : '';

  return (
    <PageFade>
      <Container className="py-12 md:py-16">
        <h1 className="heading-page">Let&apos;s Connect</h1>

        <section className="mt-5 max-w-2xl">
          <p className="mt-4 text-base leading-relaxed text-prose md:text-lg">
            Reach out to us to know more about our camps, curriculum, or admissions
            process. Whether you&apos;re a parent, educator, or just someone exploring
            a different kind of learning, we&apos;re here.
          </p>
        </section>

        <div className="mt-10 space-y-3 text-prose">
          {email ? (
            <p>
              <span className="font-medium text-accent dark:text-emerald-200">
                Email:{' '}
              </span>
              <a href={`mailto:${email}`} className="link-app">
                {email}
              </a>
            </p>
          ) : null}
          {phone ? (
            <p>
              <span className="font-medium text-accent dark:text-emerald-200">
                Phone:{' '}
              </span>
              {telHref ? (
                <a href={`tel:${telHref}`} className="link-app">
                  {phone.startsWith('+') ? phone : `+91 ${phone.trim()}`}
                </a>
              ) : (
                phone
              )}
            </p>
          ) : null}
          {address ? (
            <p>
              <span className="font-medium text-accent dark:text-emerald-200">
                Address:{' '}
              </span>
              {maps ? (
                <a
                  href={maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-app"
                >
                  {address}
                </a>
              ) : (
                address
              )}
            </p>
          ) : null}
        </div>

        {embedUrl ? (
          <div className="mt-10">
            <h2 className="heading-card mb-4">Location</h2>
            <div className="map-frame">
              <div className="relative aspect-[16/10] w-full min-h-[280px] bg-neutral-200 dark:bg-neutral-800">
                <iframe
                  title="Valmiki Ashram on Google Maps"
                  src={embedUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
            {maps ? (
              <p className="mt-3 text-sm text-prose-muted">
                <a href={maps} target="_blank" rel="noopener noreferrer" className="link-app">
                  Open in Google Maps
                </a>
              </p>
            ) : null}
          </div>
        ) : null}
      </Container>
    </PageFade>
  );
}
