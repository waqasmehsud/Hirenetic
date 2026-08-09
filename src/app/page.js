'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BRAND_CONFIG } from '@/theme/branding.config';
import { ArrowRight, Code2, ShieldCheck, Lock, CheckCircle2, UserCheck, Briefcase } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const handleNavReplace = (path) => (e) => {
    e.preventDefault();
    router.replace(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              {BRAND_CONFIG.companyName}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it Works</a>
            <a href="#trust" className="hover:text-slate-900 transition-colors">Trust & Privacy</a>
            <a href="/candidate-panel/login" onClick={handleNavReplace('/candidate-panel/login')} className="hover:text-slate-900 transition-colors">Log in</a>
            <a 
              href="/candidate-panel/signup" 
              onClick={handleNavReplace('/candidate-panel/signup')}
              className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              Create Profile
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-16 md:pt-40 md:pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Let your work speak for itself.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The AI-powered career network built for developers. We verify your GitHub, production code, and real technical achievements—connecting you directly with top engineering teams without ATS keyword filters.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/candidate-panel/signup" 
              onClick={handleNavReplace('/candidate-panel/signup')}
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
            >
              Create Candidate Profile
              <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href="/hr-panel/login" 
              onClick={handleNavReplace('/hr-panel/login')}
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-center transition-colors"
            >
              I am an Employer
            </a>
          </div>
        </div>
      </main>

      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">A better way to get hired</h2>
            <p className="text-slate-600">
              Skip the keyword optimization game. Our platform evaluates your actual technical background to match you with relevant roles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-5">
                <Briefcase className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">1. Upload your details</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Upload your standard CV. Our system parses your professional background and structures it for technical recruiters.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-5">
                <Code2 className="w-5 h-5 text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">2. Connect your work</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Link your GitHub, LinkedIn, or portfolio. We automatically audit and highlight your repositories and tech stack.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-5">
                <UserCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">3. Direct matching</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your verified profile is presented to vetted employers actively looking for your specific engineering skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            <div className="flex-1 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Privacy and control come first.</h2>
                <p className="text-slate-600 text-lg">
                  Job searching requires discretion. We designed this platform to ensure your data is secure and you have full control over who sees your profile.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <Lock className="w-6 h-6 text-slate-700 shrink-0" />
                  <div>
                    <h4 className="text-slate-900 font-semibold mb-1">Strict Data Protection</h4>
                    <p className="text-slate-600 text-sm">Your profile is not publicly indexed on search engines. It remains strictly within our secure matching environment.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-slate-700 shrink-0" />
                  <div>
                    <h4 className="text-slate-900 font-semibold mb-1">Vetted Employers Only</h4>
                    <p className="text-slate-600 text-sm">Every recruiter account is manually verified before they gain access to the talent pool. No spam, no third-party agencies.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-slate-700 shrink-0" />
                  <div>
                    <h4 className="text-slate-900 font-semibold mb-1">Transparent Metrics</h4>
                    <p className="text-slate-600 text-sm">You see the exact skills and metrics employers see. No hidden algorithms determining your career trajectory.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Candidate Profile</div>
                  <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3 h-3" /> Verified by System
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-2 w-full bg-slate-100 rounded"></div>
                <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
              </div>
              <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-500 flex items-center gap-2">
                <Lock className="w-4 h-4" /> 
                Only visible to approved HR accounts
              </div>
            </div>

          </div>
        </div>
      </section>

      <footer className="py-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-white">Hirenetic</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#trust" className="hover:text-white transition-colors">Trust & Privacy</a>
            <a href="/hr-panel/login" onClick={handleNavReplace('/hr-panel/login')} className="hover:text-white transition-colors">For Employers</a>
            <a href="/candidate-panel/signup" onClick={handleNavReplace('/candidate-panel/signup')} className="hover:text-white transition-colors">Create Profile</a>
            <a href="/admin-panel" onClick={handleNavReplace('/admin-panel')} className="hover:text-white transition-colors">Admin Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

