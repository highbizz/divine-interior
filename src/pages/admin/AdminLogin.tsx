import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type Form = z.infer<typeof schema>;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, error, isLoading, clearError } = useAdminStore();
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors } } =
    useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    clearError();
    const ok = await signIn(data.email, data.password);
    if (ok) navigate('/studio');
  };

  return (
    <div className="flex min-h-screen w-full bg-white">

      {/* ── Left — black brand panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-black p-12 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top — logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/banner/office-furnisho-logo.png?v=2" alt="Office Furnisho Logo" className="h-14 w-auto object-contain" />
          <span className="rounded bg-white/10 px-2 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-widest text-white/70">Admin Portal</span>
        </div>

        {/* Middle — product image */}
        <div className="relative z-10 flex-1 flex items-center justify-center py-8">
          <img
            src="https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=800&q=80"
            alt="Ergonomic Chair"
            className="max-h-72 w-auto object-contain opacity-80"
            style={{ filter: 'grayscale(100%) contrast(1.1)' }}
          />
        </div>

        {/* Bottom — copy */}
        <div className="relative z-10">
          <div className="mb-4 h-px w-10 bg-white/30" />
          <h2 className="font-display text-3xl font-light text-white leading-tight mb-3">
            Your store.<br />
            <span className="text-white/60">Your control.</span>
          </h2>
          <p className="font-sans text-sm text-white/40 max-w-xs leading-relaxed">
            Manage products, orders, customers and content from one clean dashboard.
          </p>
          <div className="mt-8 flex gap-6">
            {[['10+','Products'],['100%','Uptime'],['24/7','Access']].map(([n,l]) => (
              <div key={l}>
                <p className="font-display text-xl font-semibold text-white">{n}</p>
                <p className="font-sans text-[10px] uppercase tracking-wider text-white/35 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right — white form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-8 py-12 lg:px-14">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="mb-8 flex lg:hidden items-center gap-3">
            <img src="/banner/office-furnisho-logo.png?v=2" alt="Office Furnisho Logo" className="h-12 w-auto object-contain" />
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-widest text-gray-500">Admin</span>
          </div>

          {/* Heading */}
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-400 mb-2">
            Admin Portal
          </p>
          <h1 className="font-display text-3xl font-normal text-black mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="font-sans text-sm text-gray-400 mb-8">
            Sign in to your admin dashboard
          </p>

          {/* Tab toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-8">
            <div className="flex-1 rounded-md bg-black py-2.5 text-center shadow-sm">
              <span className="font-sans text-xs font-semibold text-white">Login</span>
            </div>
            <div className="flex-1 py-2.5 text-center">
              <span className="font-sans text-xs font-medium text-gray-400">Sign Up</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@divine.com"
                className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 font-sans text-sm text-black placeholder-gray-300 outline-none transition focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
                {...register('email')}
              />
              {errors.email && <p className="font-sans text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Password
                </label>
                <button type="button" className="font-sans text-[10px] font-semibold text-gray-400 hover:text-black transition-colors">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 pr-11 font-sans text-sm text-black placeholder-gray-300 outline-none transition focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="font-sans text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="font-sans text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex w-full items-center justify-center gap-2 h-11 rounded-lg bg-black font-sans text-sm font-semibold text-white transition-all hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                : <>Sign In <ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center">
            <Link to="/" className="font-sans text-xs text-gray-400 hover:text-black transition-colors flex items-center gap-1.5">
              <ArrowRight className="h-3 w-3 rotate-180" />
              Back to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
