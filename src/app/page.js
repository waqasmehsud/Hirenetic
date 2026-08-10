'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BRAND_CONFIG } from '@/theme/branding.config';
import {
  ArrowRight, Search, Target, ShieldCheck, Database,
  Lock, Sparkles, CheckCircle2, UserCheck, BarChart3, Network
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const handleNavReplace = (path) => (e) => {
    e.preventDefault();
    router.replace(path);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      
      {/* 1. Header / Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleNavReplace('/')}>
            <img src="/logo.svg" alt="Hirenetic Logo" className="w-8 h-8 rounded" />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              {BRAND_CONFIG.companyName}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#opportunities" className="hover:text-blue-600 transition-colors">Opportunities</a>
            <a href="#trust" className="hover:text-blue-600 transition-colors">Trust & Privacy</a>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <a href="/candidate-panel/login" onClick={handleNavReplace('/candidate-panel/login')} className="text-slate-600 hover:text-blue-600 transition-colors hidden md:block">Log in</a>
            <a 
              href="/candidate-panel/signup" 
              onClick={handleNavReplace('/candidate-panel/signup')}
              className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
            >
              Create Profile
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        
        {/* 2. Hero Section */}
        <section className="pt-20 pb-24 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[100px] -z-10 opacity-70"></div>
          
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6 border border-blue-100">
              <Sparkles className="w-4 h-4" />
              <span>Skills-based • AI-powered • Career-focused</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1] max-w-4xl mx-auto">
              Find the right opportunity. <span className="text-blue-600">Know why you match.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Hirenetic is an AI-powered career platform that helps students discover relevant internships and jobs based on their <strong>skills, experience, interests, and career goals.</strong>
              <br/><br/>
              We bring opportunities from multiple career portals and company websites into one intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="/candidate-panel/signup" 
                onClick={handleNavReplace('/candidate-panel/signup')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Create Candidate Profile
              </a>
              <a 
                href="#opportunities" 
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-center transition-all"
              >
                Explore Opportunities
              </a>
            </div>
          </div>
        </section>

        {/* 3. How It Works */}
        <section id="how-it-works" className="py-24 px-6 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">From Your Skills to the Right Opportunity</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Build Your Profile", desc: "Add your resume, skills, education, projects and career interests.", icon: <UserCheck className="w-6 h-6" /> },
                { step: "02", title: "Discover Opportunities", desc: "Find internships and jobs collected from multiple career platforms and company websites.", icon: <Search className="w-6 h-6" /> },
                { step: "03", title: "Understand Your Match", desc: "See your match score, matched skills, missing requirements and why the opportunity is recommended.", icon: <BarChart3 className="w-6 h-6" /> },
                { step: "04", title: "Apply & Track", desc: "Apply through the relevant opportunity and keep track of your application journey.", icon: <CheckCircle2 className="w-6 h-6" /> }
              ].map((item, i) => (
                <div key={i} className="relative p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="text-6xl font-black text-slate-50 absolute right-4 top-4 -z-10 group-hover:text-blue-50 transition-colors">{item.step}</div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Skills & Opportunity Alignment */}
        <section id="opportunities" className="py-24 px-6">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Don't just apply. Know your fit.</h2>
            <p className="text-lg text-slate-600">Hirenetic compares your profile with real industry requirements.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 transform transition-transform hover:-translate-y-1 duration-500">
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Software Engineering Intern</h3>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-3xl font-black text-emerald-500">87% Match</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4">You Match</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-base font-medium text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Python</li>
                    <li className="flex items-center gap-2 text-base font-medium text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> SQL</li>
                    <li className="flex items-center gap-2 text-base font-medium text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Git</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4">Skill Gap</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-base font-medium text-slate-600"><span className="w-2 h-2 rounded-full bg-slate-400 ml-1 mr-1"></span> Docker</li>
                    <li className="flex items-center gap-2 text-base font-medium text-slate-600"><span className="w-2 h-2 rounded-full bg-slate-400 ml-1 mr-1"></span> AWS</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-8 text-center sm:text-left">
                <p className="text-blue-900 font-medium">
                  <strong>Strong match.</strong> Improve Docker & AWS fundamentals to increase competitiveness.
                </p>
              </div>

              <div className="text-center font-bold text-xl text-slate-800 pt-2">
                Know what you have. Know what you need.
              </div>
            </div>
          </div>
        </section>

        {/* 5. Data Intelligence */}
        <section className="py-24 px-6 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-blue-900/50 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-800/50">
              <Database className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Data Farming is Key</h2>
            <p className="text-lg text-slate-400 mb-16 max-w-2xl mx-auto">
              Hirenetic continuously collects and analyzes opportunities from across the web.
            </p>
            
            <div className="flex flex-col items-center gap-4 text-xl font-medium text-blue-200 mb-12 bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-2xl mx-auto">
              <span>Industry Requirements</span>
              <span className="text-slate-500 text-sm">↓</span>
              <span>Skills & Technologies</span>
              <span className="text-slate-500 text-sm">↓</span>
              <span>Student Profiles</span>
              <span className="text-slate-500 text-sm">↓</span>
              <span>Opportunity Alignment</span>
              <span className="text-slate-500 text-sm">↓</span>
              <span className="text-3xl font-bold text-white mt-2">Career Intelligence</span>
            </div>

            <p className="text-xl font-medium text-blue-300">
              This helps students understand what the industry is actually looking for.
            </p>
          </div>
        </section>

        {/* 6. Trust & Privacy */}
        <section id="trust" className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Your career data stays under your control.</h2>
            
            <ul className="text-lg text-slate-600 space-y-4 mb-12 inline-block text-left">
              <li className="flex items-center gap-3"><Lock className="w-5 h-5 text-blue-500" /> Secure profile and application data</li>
              <li className="flex items-center gap-3"><Lock className="w-5 h-5 text-blue-500" /> Controlled profile visibility</li>
              <li className="flex items-center gap-3"><Lock className="w-5 h-5 text-blue-500" /> Verified employer access</li>
              <li className="flex items-center gap-3"><Lock className="w-5 h-5 text-blue-500" /> Transparent matching</li>
              <li className="flex items-center gap-3"><Lock className="w-5 h-5 text-blue-500" /> Security-focused AI infrastructure</li>
            </ul>

            <div className="text-xl font-bold text-slate-800">
              Built with privacy and security in mind.
            </div>
          </div>
        </section>

        {/* 7. Final CTA */}
        <section className="py-32 px-6 text-center bg-blue-50 border-t border-blue-100">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Your next opportunity is out there.</h2>
          <p className="text-xl font-medium text-blue-700 mb-10 max-w-2xl mx-auto">
            Find it. Understand it. Prepare for it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/candidate-panel/signup" 
              onClick={handleNavReplace('/candidate-panel/signup')}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              Create Candidate Profile
            </a>
            <a 
              href="#opportunities" 
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-lg transition-all"
            >
              Explore Opportunities
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white pt-12 pb-8 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.svg" alt="Hirenetic Logo" className="w-8 h-8 rounded" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              {BRAND_CONFIG.companyName}
            </span>
          </div>
          <p className="text-slate-600 font-medium mb-8">
            AI-powered career intelligence for the next generation of talent.
          </p>
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600 mb-8">
            <a href="#how-it-works" className="hover:text-blue-600">How It Works</a>
            <span>|</span>
            <a href="#opportunities" className="hover:text-blue-600">Opportunities</a>
            <span>|</span>
            <a href="#trust" className="hover:text-blue-600">Trust & Privacy</a>
            <span>|</span>
            <a href="/hr-panel/login" onClick={handleNavReplace('/hr-panel/login')} className="hover:text-blue-600">For Employers</a>
            <span>|</span>
            <a href="/candidate-panel/login" onClick={handleNavReplace('/candidate-panel/login')} className="hover:text-blue-600">Log in</a>
            <span>|</span>
            <a href="/candidate-panel/signup" onClick={handleNavReplace('/candidate-panel/signup')} className="hover:text-blue-600">Create Profile</a>
          </div>
          
          <div className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Hirenetic. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
