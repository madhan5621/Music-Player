import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Mail, Lock, Eye, EyeOff, Headphones, Disc3, AudioWaveform } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

/* ── floating particle component ── */
function FloatingParticle({ delay, duration, x, y, size }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, rgba(0, 229, 255, 0.25) 0%, transparent 70%)`,
      }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.2, 0.6, 0.2],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

/* ── animated equalizer bars ── */
function EqualizerBars() {
  const bars = [
    { h: '60%', delay: 0 },
    { h: '85%', delay: 0.15 },
    { h: '45%', delay: 0.3 },
    { h: '70%', delay: 0.1 },
    { h: '55%', delay: 0.25 },
    { h: '90%', delay: 0.05 },
    { h: '40%', delay: 0.2 },
  ];

  return (
    <div className="flex items-end gap-[3px] h-10">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{
            background: 'linear-gradient(to top, rgba(0, 229, 255, 0.6), rgba(120, 0, 255, 0.4))',
          }}
          animate={{
            height: ['20%', bar.h, '30%', bar.h, '20%'],
          }}
          transition={{
            duration: 1.2,
            delay: bar.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ── vinyl disc animation ── */
function VinylDisc() {
  return (
    <motion.div
      className="relative w-40 h-40 sm:w-52 sm:h-52"
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg,
            rgba(0, 229, 255, 0.15),
            rgba(120, 0, 255, 0.1),
            rgba(0, 229, 255, 0.2),
            rgba(120, 0, 255, 0.15),
            rgba(0, 229, 255, 0.15))`,
          border: '2px solid rgba(0, 229, 255, 0.2)',
        }}
      />
      {/* Groove rings */}
      {[30, 42, 54, 66, 78].map((size) => (
        <div
          key={size}
          className="absolute rounded-full"
          style={{
            width: `${size}%`,
            height: `${size}%`,
            top: `${(100 - size) / 2}%`,
            left: `${(100 - size) / 2}%`,
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        />
      ))}
      {/* Center label */}
      <div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: '22%',
          height: '22%',
          top: '39%',
          left: '39%',
          background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.3), rgba(120, 0, 255, 0.3))',
          border: '2px solid rgba(0, 229, 255, 0.3)',
        }}
      >
        <div className="w-2 h-2 rounded-full bg-accent/60" />
      </div>
    </motion.div>
  );
}

/* ── reusable input field ── */
function InputField({ id, icon: Icon, label, type = 'text', value, onChange, onFocus, onBlur, placeholder, required, focused, fieldName, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: '#A1A1AA', letterSpacing: '0.08em' }}
      >
        {label}
      </label>
      <div
        className="relative flex items-stretch rounded-xl overflow-hidden"
        style={{
          background: '#111111',
          border: `1.5px solid ${focused === fieldName ? 'rgba(0, 229, 255, 0.5)' : '#2A2A2A'}`,
          boxShadow: focused === fieldName
            ? '0 0 0 3px rgba(0, 229, 255, 0.08), 0 0 20px rgba(0, 229, 255, 0.06)'
            : 'none',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Icon area */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 44,
            minWidth: 44,
            background: focused === fieldName ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            borderRight: `1px solid ${focused === fieldName ? 'rgba(0, 229, 255, 0.2)' : '#2A2A2A'}`,
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          <Icon size={16} style={{ color: focused === fieldName ? '#00E5FF' : '#71717A', transition: 'color 0.3s' }} />
        </div>
        {/* Input */}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          className="flex-1 min-w-0 py-3.5 px-3 text-sm outline-none"
          style={{
            background: 'transparent',
            color: '#FFFFFF',
            caretColor: '#00E5FF',
          }}
        />
        {/* Optional trailing element (eye toggle, etc.) */}
        {children}
      </div>
    </div>
  );
}

/* ── main login component ── */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error is set in store
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <div className="flex min-h-screen min-h-[100dvh] overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── LEFT PANEL (visual showcase — desktop only) ── */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden">
        {/* Deep mesh background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 30% 20%, rgba(0, 229, 255, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(120, 0, 255, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(0, 229, 255, 0.05) 0%, transparent 60%),
              linear-gradient(135deg, #050510 0%, #0a0a1a 50%, #080818 100%)`,
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 229, 255, 0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0, 229, 255, 0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating particles */}
        <FloatingParticle delay={0} duration={4} x={15} y={20} size={80} />
        <FloatingParticle delay={1} duration={5} x={70} y={15} size={60} />
        <FloatingParticle delay={2} duration={3.5} x={40} y={70} size={100} />
        <FloatingParticle delay={0.5} duration={4.5} x={80} y={60} size={50} />
        <FloatingParticle delay={1.5} duration={6} x={25} y={80} size={70} />
        <FloatingParticle delay={3} duration={4} x={60} y={40} size={40} />

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <VinylDisc />
          </motion.div>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <EqualizerBars />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-10"
          >
            <h2
              className="text-4xl xl:text-5xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #00E5FF 50%, #7800FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Your Music,
              <br />
              Your Universe
            </h2>
            <p className="mt-4 text-base xl:text-lg max-w-sm mx-auto" style={{ color: '#71717A' }}>
              Stream your personal cloud library from anywhere. High-quality audio, curated playlists, and immersive experience.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {[
              { icon: Headphones, label: 'Hi-Fi Audio' },
              { icon: Disc3, label: 'Smart Playlists' },
              { icon: AudioWaveform, label: 'Live Analytics' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(0, 229, 255, 0.06)',
                  border: '1px solid rgba(0, 229, 255, 0.15)',
                  color: '#A1A1AA',
                }}
              >
                <Icon size={14} style={{ color: '#00E5FF' }} />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to top, #080808, transparent)' }}
        />
      </div>

      {/* ── RIGHT PANEL (login form) ── */}
      <div
        className="flex w-full lg:w-[45%] items-center justify-center px-6 sm:px-8 py-10 relative"
        style={{ background: '#080808' }}
      >
        {/* Subtle glow behind form on mobile */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background: `
              radial-gradient(ellipse at 50% 20%, rgba(0, 229, 255, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 30% 70%, rgba(120, 0, 255, 0.05) 0%, transparent 50%)`,
          }}
        />

        {/* Left edge glow (desktop) */}
        <div
          className="hidden lg:block absolute left-0 top-0 bottom-0 w-32"
          style={{
            background: 'linear-gradient(to right, rgba(0, 229, 255, 0.03), transparent)',
          }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <motion.div variants={itemVariants} className="lg:hidden mb-8 text-center">
            <div
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: 'rgba(0, 229, 255, 0.15)',
                boxShadow: '0 0 30px rgba(0, 229, 255, 0.15), 0 0 60px rgba(0, 229, 255, 0.05)',
              }}
            >
              <Music2 size={26} style={{ color: '#00E5FF' }} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Madhan Music</h1>
          </motion.div>

          {/* Welcome text */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: '#71717A' }}>
              Sign in to continue listening to your music
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="rounded-xl px-4 py-3 text-sm flex items-center gap-2.5"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#EF4444',
                  }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#EF4444' }} />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <motion.div variants={itemVariants}>
              <InputField
                id="login-email"
                icon={Mail}
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                required
                focused={focused}
                fieldName="email"
              />
            </motion.div>

            {/* Password field */}
            <motion.div variants={itemVariants}>
              <InputField
                id="login-password"
                icon={Lock}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                required
                focused={focused}
                fieldName="password"
              >
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center justify-center flex-shrink-0 px-3"
                  style={{ color: '#71717A' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </InputField>
            </motion.div>

            {/* Submit button */}
            <motion.div variants={itemVariants} className="pt-1">
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden rounded-xl py-3.5 text-sm font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
                  color: '#080808',
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 20px rgba(0, 229, 255, 0.2), 0 4px 15px rgba(0, 229, 255, 0.15)',
                }}
                whileHover={!isLoading ? {
                  boxShadow: '0 0 30px rgba(0, 229, 255, 0.35), 0 6px 20px rgba(0, 229, 255, 0.25)',
                  scale: 1.01,
                } : {}}
                whileTap={!isLoading ? { scale: 0.985 } : {}}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                  }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 rounded-full"
                        style={{ border: '2px solid rgba(8, 8, 8, 0.3)', borderTopColor: '#080808' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </span>
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #2A2A2A)' }} />
            <span className="text-xs font-medium" style={{ color: '#71717A' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #2A2A2A)' }} />
          </motion.div>

          {/* Sign up link */}
          <motion.p variants={itemVariants} className="text-center text-sm" style={{ color: '#71717A' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold inline-flex items-center gap-1"
              style={{ color: '#00E5FF' }}
            >
              Create one
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </Link>
          </motion.p>

          {/* Footer branding */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex items-center justify-center gap-2"
          >
            <div
              className="flex h-6 w-6 items-center justify-center rounded-lg"
              style={{ background: 'rgba(0, 229, 255, 0.1)' }}
            >
              <Music2 size={12} style={{ color: '#00E5FF' }} />
            </div>
            <span className="text-xs font-medium" style={{ color: '#333333' }}>
              Madhan Music • Personal Cloud Streaming
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
