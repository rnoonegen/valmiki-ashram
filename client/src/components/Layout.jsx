import { Outlet } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Footer from './Footer';
import Navbar from './Navbar';

export default function Layout() {
  const wa = process.env.REACT_APP_WHATSAPP_COMMUNITY_LINK;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-neutral-50 dark:bg-neutral-950">
        <Outlet />
      </main>
      <Footer />
      {wa ? (
        <motion.a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-black/10 dark:ring-white/15"
          aria-label="Join WhatsApp community"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaWhatsapp className="h-8 w-8" />
        </motion.a>
      ) : null}
    </div>
  );
}
