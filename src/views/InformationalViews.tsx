import React, { useState } from 'react';
import { Shield, Zap, Lock, Sparkles, CheckCircle, Mail, Send, Check } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Link } from '../context/RouterContext';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      <Breadcrumbs items={[{ label: 'About ToolNest' }]} />

      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-4">
          About ToolNest
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
          ToolNest was built on a simple premise: everyday digital tasks should not require dozens of ad-ridden, slow, cookie-bloated websites.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-white mb-2">100% Client-Side</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Your images, text, and data never leave your browser sandbox. Processing is performed locally on your device for absolute privacy.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-white mb-2">Instant Speed</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            No server round-trips or queues. Calculations, formatting, and file generation execute at native browser speeds with zero lag.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-white mb-2">Always Free</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            No hidden subscription walls, watermark traps, or mandatory account logins. Open, use, and finish your work friction-free.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-sm text-neutral-600 dark:text-neutral-400 space-y-3 leading-relaxed">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white">Our Architecture</h3>
        <p>
          ToolNest is architected as an extensible, modular TypeScript platform. Every utility operates as an independent, testable module that plugs into a standardized design system and responsive layout.
        </p>
      </div>
    </div>
  );
};

export const PrivacyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

      <div>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-neutral-500">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">1. Client-Side Execution Guarantee</h2>
          <p>
            At ToolNest, we adhere to a strict client-side first architecture. Text tools, calculators, JSON formatters, and QR generators run entirely inside your browser's JavaScript engine. We do not transmit or store your inputs on remote servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">2. No Account or Personal Data Collection</h2>
          <p>
            ToolNest does not require user registration, email logins, or personal profiling to access any tool. You can use all features anonymously.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">3. Local Storage Preferences</h2>
          <p>
            We only use standard browser local storage (`localStorage`) to remember your theme preference (Dark or Light mode) across sessions.
          </p>
        </section>
      </div>
    </div>
  );
};

export const TermsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

      <div>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-neutral-500">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and using ToolNest, you accept and agree to be bound by the terms and provisions of this agreement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">2. Permitted Use</h2>
          <p>
            You are free to use ToolNest tools for both personal and commercial tasks. You may not attempt to reverse engineer, abuse, or initiate denial-of-service attempts against the platform infrastructure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">3. Disclaimer of Warranties</h2>
          <p>
            The utilities and calculators on ToolNest are provided "as is" without warranty of any kind. While we rigorously test all algorithms (such as financial equations and cryptographic hashes), you should verify critical calculations independently.
          </p>
        </section>
      </div>
    </div>
  );
};

export const ContactView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '', toolRequest: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <Breadcrumbs items={[{ label: 'Contact & Feedback' }]} />

      <div>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-2">
          Contact & Tool Requests
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
          Have an idea for a new tool or noticed an improvement we should make? Send us a message!
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-3 animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Thank You for Your Feedback!</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            We review every suggestion as we expand our tools directory.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              Your Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="e.g. Alex Smith"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="alex@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              Message or Tool Suggestion
            </label>
            <textarea
              rows={5}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="What tool should we add next or what can we improve?"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        </form>
      )}
    </div>
  );
};

export const NotFoundView: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
      <div className="text-6xl font-extrabold text-emerald-600 dark:text-emerald-400">404</div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Page or Tool Not Found</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        The tool or page you are looking for might have been moved or doesn't exist yet.
      </p>
      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};
