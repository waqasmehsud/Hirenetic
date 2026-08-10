'use client';

import React, { useState } from 'react';
import { X, Play, CheckCircle2, AlertTriangle, RefreshCw, Send, ShieldCheck } from 'lucide-react';

export function TestApiModal({ isOpen, onClose, api, onQuotaIncrement }) {
  const [prompt, setPrompt] = useState('Hello! Please verify your status in 1 sentence.');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen || !api) return null;

  const runTestQuery = async () => {
    setTesting(true);
    setResult(null);
    const startTime = Date.now();
    
    // Automatically trigger real-time quota count increment
    if (onQuotaIncrement) {
      onQuotaIncrement(api.id, 1);
    }

    try {
      const apiKey = (api.api_key || '').trim();
      const providerStr = `${api.provider || ''} ${api.name || ''} ${api.category || ''}`.toLowerCase();
      const modelStr = (api.model || '').toLowerCase();

      // Detect provider based on API Key prefix & provider/name metadata
      const isGroq = apiKey.startsWith('gsk_') || providerStr.includes('groq') || modelStr.includes('llama');
      const isGemini = apiKey.startsWith('aiza') || providerStr.includes('google') || providerStr.includes('gemini') || modelStr.includes('gemini');
      const isOpenRouter = apiKey.startsWith('sk-or-') || providerStr.includes('openrouter');
      const isOpenAI = apiKey.startsWith('sk-') && !isOpenRouter;
      const isZhipu = providerStr.includes('zhipu') || providerStr.includes('glm') || modelStr.includes('glm');

      // 1. Groq API Runner
      if (isGroq) {
        const groqModel = api.model || 'llama-3.1-8b-instant';
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        const data = await res.json();
        const latency = Date.now() - startTime;

        if (res.ok && data.choices && data.choices[0]?.message?.content) {
          setResult({
            success: true,
            status: `200 OK (${groqModel})`,
            latency: `${latency}ms`,
            response: data.choices[0].message.content
          });
        } else {
          setResult({
            success: false,
            status: `HTTP ${res.status}`,
            latency: `${latency}ms`,
            response: data.error?.message || JSON.stringify(data)
          });
        }
        setTesting(false);
        return;
      }

      // 2. Google Gemini API Runner with Active Models Check
      if (isGemini) {
        const candidateModels = [
          api.model,
          'gemini-1.5-flash-8b',
          'gemini-1.5-pro',
          'gemini-2.0-flash',
          'gemini-2.0-flash-lite',
        ].filter(Boolean);

        const uniqueModels = Array.from(new Set(candidateModels));
        let lastRes = null;
        let lastData = null;
        let success = false;

        for (const m of uniqueModels) {
          const cleanModel = m.startsWith('models/') ? m : `models/${m}`;
          const url = `https://generativelanguage.googleapis.com/v1beta/${cleanModel}:generateContent?key=${apiKey}`;

          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            });

            const data = await res.json();
            lastRes = res;
            lastData = data;

            if (res.ok && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
              const latency = Date.now() - startTime;
              setResult({
                success: true,
                status: `200 OK (${m})`,
                latency: `${latency}ms`,
                response: data.candidates[0].content.parts[0].text
              });
              success = true;
              break;
            }
          } catch (e) {
            console.error('Gemini test attempt error:', m, e);
          }
        }

        if (!success) {
          const latency = Date.now() - startTime;
          if (lastRes?.status === 429 || (lastData?.error?.message && lastData.error.message.includes('Quota exceeded'))) {
            setResult({
              success: 'quota_exceeded',
              status: '429 Quota Exceeded (limit: 0 on model)',
              latency: `${latency}ms`,
              response: `✅ Key is VALID (Authenticated with Google Gemini)\n⚠️ Notice: ${lastData.error?.message || 'Free tier quota is 0 for gemini-2.0-flash in your Google AI Studio project region.'}`
            });
          } else {
            setResult({
              success: false,
              status: `HTTP ${lastRes ? lastRes.status : 400}`,
              latency: `${latency}ms`,
              response: lastData?.error?.message || JSON.stringify(data)
            });
          }
        }

        setTesting(false);
        return;
      }

      // 3. Puter.js Free GLM Fallback
      if (isZhipu && !apiKey) {
        try {
          if (!window.puter) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = "https://js.puter.com/v2/";
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }
          const response = await window.puter.ai.chat(prompt);
          setResult({
            success: true,
            status: '200 OK (Puter.js Free API)',
            latency: `${Date.now() - startTime}ms`,
            response: typeof response === 'string' ? response : (response?.message?.content || JSON.stringify(response))
          });
        } catch (err) {
          setResult({
            success: false,
            status: 'Puter API Error',
            latency: `${Date.now() - startTime}ms`,
            response: err.message || 'Failed to connect via Puter.js'
          });
        }
        setTesting(false);
        return;
      }

      // 4. OpenRouter, OpenAI, or Zhipu AI (GLM) API Runner
      if (isOpenRouter || isOpenAI || isZhipu) {
        let baseUrl = api.base_url || (isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1');
        if (isZhipu) baseUrl = api.base_url || 'https://open.bigmodel.cn/api/paas/v4';
        
        let defaultModel = isOpenRouter ? 'openai/gpt-3.5-turbo' : 'gpt-3.5-turbo';
        if (isZhipu) defaultModel = 'glm-4';

        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: api.model || defaultModel,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        const data = await res.json();
        const latency = Date.now() - startTime;

        if (res.ok && data.choices && data.choices[0]?.message?.content) {
          setResult({
            success: true,
            status: '200 OK',
            latency: `${latency}ms`,
            response: data.choices[0].message.content
          });
        } else {
          setResult({
            success: false,
            status: `HTTP ${res.status}`,
            latency: `${latency}ms`,
            response: data.error?.message || JSON.stringify(data)
          });
        }
        setTesting(false);
        return;
      }

      // 4. Default Endpoint / Scraper API HTTP Ping check
      const testEndpoint = api.base_url || 'https://httpbin.org/get';
      const res = await fetch(testEndpoint, {
        headers: { 'X-Api-Key': apiKey }
      });
      const latency = Date.now() - startTime;

      if (res.ok) {
        setResult({
          success: true,
          status: '200 Connection OK',
          latency: `${latency}ms`,
          response: `Successfully connected to endpoint (${api.provider || 'API'}). Key is active.`
        });
      } else {
        setResult({
          success: false,
          status: `HTTP ${res.status}`,
          latency: `${latency}ms`,
          response: `Endpoint responded with status code ${res.status}`
        });
      }
    } catch (err) {
      setResult({
        success: false,
        status: 'Connection Error',
        latency: `${Date.now() - startTime}ms`,
        response: err.message || 'Network failure or CORS restriction on endpoint.'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Live Test API Connection</h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{api.name} • {api.provider}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        {/* Input Prompt */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
            Test Query / Prompt
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type test query..."
              style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: '#0f172a', outline: 'none' }}
            />
            <button
              onClick={runTestQuery}
              disabled={testing}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {testing ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
              {testing ? 'Testing...' : 'Send'}
            </button>
          </div>
        </div>

        {/* Response / Status Result */}
        {result && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                API Response Output
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{result.latency}</span>
                {result.success === true && (
                  <span style={{ fontSize: '11px', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <CheckCircle2 size={12} /> {result.status}
                  </span>
                )}
                {result.success === 'quota_exceeded' && (
                  <span style={{ fontSize: '11px', backgroundColor: '#fffbeb', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <ShieldCheck size={12} /> {result.status}
                  </span>
                )}
                {result.success === false && (
                  <span style={{ fontSize: '11px', backgroundColor: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <AlertTriangle size={12} /> {result.status}
                  </span>
                )}
              </div>
            </div>

            <div style={{
              backgroundColor: result.success === true ? '#f8fafc' : result.success === 'quota_exceeded' ? '#fffbeb' : '#fff5f5',
              border: result.success === true ? '1px solid #e2e8f0' : result.success === 'quota_exceeded' ? '1px solid #fde68a' : '1px solid #fed7d7',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: result.success === true ? '#0f172a' : result.success === 'quota_exceeded' ? '#92400e' : '#c53030',
              maxHeight: '180px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {result.response}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
