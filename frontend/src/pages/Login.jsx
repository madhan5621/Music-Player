import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Headphones,
  Lock,
  Mail,
  Music2,
  Play,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const T = {
  surface: {
    base: '#0A0D10',
    shell: '#10151A',
    card: '#161C22',
    raised: '#1D252D',
    border: '#27313A',
  },
  accent: '#03AAE2',
  text: {
    primary: '#F2F5F7',
    secondary: '#B8C2CC',
    muted: '#7F8B96',
  },
  support: {
    violet: '#7C6CFF',
    coral: '#FF7A6A',
    lime: '#8DDC6F',
  },
};

const albumStack = [
  {
    title: 'Midnight Tape',
    artist: 'Arun Vale',
    color: `linear-gradient(135deg, #0F4C81 0%, ${T.accent} 48%, #13202A 100%)`,
  },
  {
    title: 'Rain Room',
    artist: 'Mira Sol',
    color: `linear-gradient(135deg, #261C3D 0%, ${T.support.violet} 48%, #0D1117 100%)`,
  },
  {
    title: 'After Hours FM',
    artist: 'The Static Line',
    color: `linear-gradient(135deg, #41251F 0%, ${T.support.coral} 48%, #11161B 100%)`,
  },
];

function AlbumArtwork({ item, className = '', active = false }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: '1 / 1',
        borderRadius: active ? 24 : 18,
        background: item.color,
        boxShadow: active
          ? '0 28px 70px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.12)'
          : '0 18px 42px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, rgba(255,255,255,0.18), transparent 34%), radial-gradient(circle at 74% 20%, rgba(255,255,255,0.24), transparent 24%)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '54%',
          height: '54%',
          left: '23%',
          top: '23%',
          border: '1px solid rgba(255,255,255,0.26)',
          boxShadow: 'inset 0 0 0 18px rgba(0,0,0,0.16), inset 0 0 0 19px rgba(255,255,255,0.12)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 18,
          height: 18,
          left: 'calc(50% - 9px)',
          top: 'calc(50% - 9px)',
          background: T.surface.base,
          boxShadow: '0 0 0 5px rgba(255,255,255,0.12)',
        }}
      />
      <div className="absolute bottom-4 left-4 right-4">
        <p className="truncate text-sm font-semibold" style={{ color: T.text.primary }}>
          {item.title}
        </p>
        <p className="truncate text-xs" style={{ color: 'rgba(242,245,247,0.72)' }}>
          {item.artist}
        </p>
      </div>
    </div>
  );
}

function AuthVisual() {
  return (
    <section className="relative hidden min-h-[100dvh] overflow-hidden lg:flex lg:w-[58%]">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 34% 26%, rgba(3,170,226,0.16), transparent 42%),
            radial-gradient(ellipse at 72% 72%, rgba(124,108,255,0.12), transparent 46%),
            linear-gradient(145deg, ${T.surface.base} 0%, ${T.surface.shell} 54%, #070A0D 100%)`,
        }}
      />
      <div className="relative z-10 grid w-full grid-cols-[minmax(0,1fr)_210px] items-center gap-10 px-12 xl:px-16">
        <div className="max-w-[560px]">
          <div className="mb-7 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center"
              style={{
                borderRadius: 16,
                background: T.surface.card,
                boxShadow: '8px 8px 18px rgba(0,0,0,0.30), -4px -4px 14px rgba(255,255,255,0.035)',
              }}
            >
              <Music2 size={23} style={{ color: T.accent }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: T.text.secondary }}>
              Madhan Music
            </span>
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <AlbumArtwork item={albumStack[0]} className="mb-8 w-full max-w-[430px]" active />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="text-[44px] font-bold leading-[1.05] xl:text-[54px]"
            style={{ color: T.text.primary }}
          >
            Pick up where the room left off.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.55 }}
            className="mt-5 max-w-[460px] text-base leading-7"
            style={{ color: T.text.secondary }}
          >
            Sign in to your cloud library, recent plays, playlists, and queue in one calm listening space.
          </motion.p>
        </div>

        <div className="flex flex-col gap-5">
          <AlbumArtwork item={albumStack[1]} className="w-full" />
          <div
            className="flex items-center gap-4 p-4"
            style={{
              borderRadius: 22,
              background: T.surface.card,
              boxShadow: '10px 10px 26px rgba(0,0,0,0.34), -4px -4px 16px rgba(255,255,255,0.035)',
            }}
          >
            <button
              type="button"
              aria-label="Preview current track"
              className="flex h-12 w-12 shrink-0 items-center justify-center"
              style={{
                borderRadius: 16,
                background: T.accent,
                color: T.surface.base,
                boxShadow: '0 0 24px rgba(3,170,226,0.24)',
              }}
            >
              <Play size={20} fill="currentColor" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold" style={{ color: T.text.primary }}>
                Now playing
              </p>
              <p className="truncate text-xs" style={{ color: T.text.muted }}>
                Midnight Tape is ready
              </p>
            </div>
          </div>
          <AlbumArtwork item={albumStack[2]} className="w-[76%] self-end" />
        </div>
      </div>
    </section>
  );
}

function MobileBrand() {
  return (
    <div className="lg:hidden">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center"
            style={{ borderRadius: 15, background: T.surface.card }}
          >
            <Music2 size={21} style={{ color: T.accent }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: T.text.secondary }}>
            Madhan Music
          </span>
        </div>
        <div className="flex -space-x-3">
          {albumStack.map((item) => (
            <AlbumArtwork key={item.title} item={item} className="h-11 w-11 border border-[#10151A]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileListeningPreview() {
  return (
    <div
      className="mb-5 flex items-center gap-4 p-5 lg:hidden"
      style={{
        borderRadius: 24,
        background: T.surface.card,
        border: '1px solid rgba(39,49,58,0.72)',
        boxShadow: '12px 12px 28px rgba(0,0,0,0.30), -4px -4px 18px rgba(255,255,255,0.025)',
      }}
    >
      <AlbumArtwork item={albumStack[0]} className="h-[92px] w-[92px] shrink-0" active />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase" style={{ color: T.text.muted, letterSpacing: '0.08em' }}>
          Last played
        </p>
        <h2 className="mt-2 truncate text-xl font-bold leading-tight" style={{ color: T.text.primary }}>
          Midnight Tape
        </h2>
        <p className="mt-1 truncate text-sm" style={{ color: T.text.secondary }}>
          Your cloud library is waiting.
        </p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full" style={{ background: T.surface.border }}>
          <div className="h-full w-[58%] rounded-full" style={{ background: T.accent }} />
        </div>
      </div>
    </div>
  );
}

function AuthInput({
  id,
  icon: Icon,
  label,
  type,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  required,
  focused,
  children,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-3 block text-sm font-medium" style={{ color: T.text.secondary }}>
        {label}
      </label>
      <div
        className="relative flex min-h-[62px] items-center overflow-hidden"
        style={{
          borderRadius: 16,
          background: focused ? T.surface.raised : T.surface.card,
          boxShadow: focused
            ? `0 0 0 3px rgba(3,170,226,0.13), inset 0 1px 0 rgba(255,255,255,0.04)`
            : 'inset 3px 3px 8px rgba(0,0,0,0.24), inset -2px -2px 8px rgba(255,255,255,0.025)',
          border: `1px solid ${focused ? 'rgba(3,170,226,0.55)' : 'rgba(39,49,58,0.78)'}`,
        }}
      >
        <Icon className="ml-5 shrink-0" size={20} style={{ color: focused ? T.accent : T.text.muted }} />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          className="min-w-0 flex-1 bg-transparent px-4 py-5 text-[15px] outline-none"
          style={{ color: T.text.primary, caretColor: T.accent }}
        />
        {children}
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Auth errors are exposed through the store.
    }
  };

  return (
    <main className="flex min-h-[100dvh] overflow-hidden" style={{ background: T.surface.base }}>
      <AuthVisual />

      <section className="relative flex min-h-[100dvh] w-full items-center justify-center px-5 py-5 sm:px-8 lg:w-[42%] lg:px-10">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 0%, rgba(3,170,226,0.10), transparent 48%),
              linear-gradient(180deg, ${T.surface.shell} 0%, ${T.surface.base} 100%)`,
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative w-full max-w-[440px]"
        >
          <MobileBrand />
          <MobileListeningPreview />

          <div
            className="p-6 sm:p-8 lg:p-10"
            style={{
              borderRadius: 26,
              background: 'rgba(16,21,26,0.92)',
              border: '1px solid rgba(39,49,58,0.78)',
              boxShadow: '18px 18px 42px rgba(0,0,0,0.36), -6px -6px 24px rgba(255,255,255,0.025)',
            }}
          >
            <div className="mb-7">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center"
                  style={{ borderRadius: 14, background: T.surface.raised }}
                >
                  <Headphones size={20} style={{ color: T.accent }} />
                </div>
                <p className="text-sm" style={{ color: T.text.muted }}>
                  Personal cloud streaming
                </p>
              </div>
              <h1 className="text-[28px] font-bold leading-tight sm:text-[32px]" style={{ color: T.text.primary }}>
                Welcome back
              </h1>
              <p className="mt-2 text-sm leading-6" style={{ color: T.text.secondary }}>
                Continue listening across your library, playlists, and saved tracks.
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 flex items-start gap-3 p-3 text-sm"
                  style={{
                    borderRadius: 16,
                    background: 'rgba(239,68,68,0.09)',
                    border: '1px solid rgba(239,68,68,0.22)',
                    color: '#FCA5A5',
                  }}
                >
                  <AlertCircle className="mt-0.5 shrink-0" size={17} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-7">
              <AuthInput
                id="login-email"
                icon={Mail}
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearError();
                }}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                required
                focused={focused === 'email'}
              />

              <AuthInput
                id="login-password"
                icon={Lock}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearError();
                }}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="Enter your password"
                required
                focused={focused === 'password'}
              >
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="mr-3 flex h-11 w-11 shrink-0 items-center justify-center"
                  style={{ borderRadius: 12, color: T.text.muted }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </AuthInput>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="flex min-h-[62px] w-full items-center justify-center gap-2 text-[15px] font-bold"
                style={{
                  borderRadius: 16,
                  background: T.accent,
                  color: T.surface.base,
                  opacity: isLoading ? 0.68 : 1,
                  boxShadow: '0 0 26px rgba(3,170,226,0.22), inset 0 1px 0 rgba(255,255,255,0.22)',
                }}
                whileTap={!isLoading ? { scale: 0.985 } : undefined}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
                {!isLoading && <ChevronRight size={18} />}
              </motion.button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-4 text-sm">
              <span style={{ color: T.text.muted }}>New to Madhan Music?</span>
              <Link className="inline-flex items-center gap-1 font-semibold" style={{ color: T.accent }} to="/register">
                Create account <ChevronRight size={16} />
              </Link>
            </div>
          </div>

        </motion.div>
      </section>
    </main>
  );
}
