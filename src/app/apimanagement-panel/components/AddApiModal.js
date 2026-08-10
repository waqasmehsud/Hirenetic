'use client';

import React, { useState } from 'react';
import { X, Eye, EyeOff, Sparkles } from 'lucide-react';

export function AddApiModal({ isOpen, onClose, onSave }) {
  const [showKey, setShowKey] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'LLM',
    provider: 'Groq',
    api_key: '',
    base_url: '',
    model: 'llama-3.1-8b-instant',
    expiration_date: '',
    daily_quota: '',
    used_quota: '0',
    refresh_cycle: 'Daily',
    notes: '',
    status: 'Active',
  });

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle Provider Dropdown Selection
  const handleProviderSelect = (e) => {
    const selectedProvider = e.target.value;
    let autoModel = formData.model;
    let autoCategory = formData.category;
    let autoName = formData.name;

    if (selectedProvider === 'Groq') {
      autoModel = 'llama-3.1-8b-instant';
      autoCategory = 'LLM';
      if (!autoName || autoName.includes('Key')) autoName = 'Groq Llama Key';
    } else if (selectedProvider === 'Google (Gemini)' || selectedProvider === 'Google') {
      autoModel = 'gemini-2.0-flash';
      autoCategory = 'LLM';
      if (!autoName || autoName.includes('Key')) autoName = 'Gemini Flash Key';
    } else if (selectedProvider === 'OpenAI') {
      autoModel = 'gpt-3.5-turbo';
      autoCategory = 'LLM';
      if (!autoName || autoName.includes('Key')) autoName = 'OpenAI Key';
    } else if (selectedProvider === 'OpenRouter') {
      autoModel = 'openai/gpt-3.5-turbo';
      autoCategory = 'LLM';
      if (!autoName || autoName.includes('Key')) autoName = 'OpenRouter Key';
    } else if (selectedProvider === 'RapidAPI (LinkedIn / Job API)') {
      autoModel = '';
      autoCategory = 'Job API';
      if (!autoName || autoName.includes('Key')) autoName = 'LinkedIn Scraper API';
    } else if (selectedProvider === 'ScraperAPI') {
      autoModel = '';
      autoCategory = 'Scraper';
      if (!autoName || autoName.includes('Key')) autoName = 'Web Scraper API';
    } else if (selectedProvider === 'Zhipu AI (GLM)' || selectedProvider === 'Puter.js (Free Zhipu GLM)') {
      autoModel = 'glm-4';
      autoCategory = 'LLM';
      if (!autoName || autoName.includes('Key')) autoName = 'Puter GLM Key';
    }

    setFormData({
      ...formData,
      provider: selectedProvider,
      model: autoModel,
      category: autoCategory,
      name: autoName,
    });
  };

  // Auto-detect Provider, Model, and Category when API key is typed/pasted
  const handleKeyChange = (e) => {
    const val = e.target.value;
    const trimmed = val.trim();

    let autoProvider = formData.provider;
    let autoModel = formData.model;
    let autoCategory = formData.category;
    let autoName = formData.name;

    if (trimmed.startsWith('gsk_')) {
      autoProvider = 'Groq';
      autoModel = 'llama-3.1-8b-instant';
      autoCategory = 'LLM';
      if (!autoName) autoName = 'Groq Llama Key';
    } else if (trimmed.startsWith('AIza')) {
      autoProvider = 'Google (Gemini)';
      autoModel = 'gemini-2.0-flash';
      autoCategory = 'LLM';
      if (!autoName) autoName = 'Gemini Flash Key';
    } else if (trimmed.startsWith('sk-or-')) {
      autoProvider = 'OpenRouter';
      autoModel = 'openai/gpt-3.5-turbo';
      autoCategory = 'LLM';
      if (!autoName) autoName = 'OpenRouter Key';
    } else if (trimmed.startsWith('sk-')) {
      autoProvider = 'OpenAI';
      autoModel = 'gpt-3.5-turbo';
      autoCategory = 'LLM';
      if (!autoName) autoName = 'OpenAI Key';
    }

    setFormData({
      ...formData,
      api_key: val,
      provider: autoProvider,
      model: autoModel,
      category: autoCategory,
      name: autoName,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const isKeyless = formData.provider.includes('Zhipu') || formData.provider.includes('Puter');
    if (!formData.name.trim() || !formData.provider.trim() || (!isKeyless && !formData.api_key.trim())) {
      setErrorMsg(isKeyless ? 'Name and Provider are required fields.' : 'Name, Provider, and API Key are required fields.');
      return;
    }

    const cleanProviderName = formData.provider.replace(/\s*\(.*?\)\s*/g, '');

    const newApi = {
      id: String(Date.now()),
      name: formData.name.trim(),
      category: formData.category,
      provider: cleanProviderName,
      api_key: formData.api_key.trim(),
      base_url: formData.base_url.trim() || null,
      model: formData.model.trim() || null,
      expiration_date: formData.expiration_date || null,
      daily_quota: formData.daily_quota ? Number(formData.daily_quota) : null,
      used_quota: formData.used_quota ? Number(formData.used_quota) : 0,
      refresh_cycle: formData.refresh_cycle || 'Daily',
      notes: formData.notes.trim() || null,
      status: formData.status,
      last_updated: new Date().toISOString(),
    };

    onSave(newApi);
    onClose();
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '4px'
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
      zIndex: 50,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '560px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Add New API Key</h2>
            <span style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Sparkles size={13} color="#2563eb" /> Select provider or paste key for auto-fill
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px', marginBottom: '14px' }}>
              {errorMsg}
            </div>
          )}

          {/* API Key Input */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>API Secret Key {(!formData.provider.includes('Zhipu') && !formData.provider.includes('Puter')) && '*'}</label>
            <div style={{ position: 'relative' }}>
              <input
                required={!formData.provider.includes('Zhipu') && !formData.provider.includes('Puter')}
                type={showKey ? 'text' : 'password'}
                placeholder="Paste API key (e.g. gsk_..., AIza..., sk-...)"
                value={formData.api_key}
                onChange={handleKeyChange}
                style={{ ...inputStyle, paddingRight: '36px' }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>API Provider *</label>
              <select
                value={formData.provider}
                onChange={handleProviderSelect}
                style={inputStyle}
              >
                <option value="Groq">⚡ Groq (Fast Llama 3)</option>
                <option value="Google (Gemini)">🤖 Google (Gemini AI)</option>
                <option value="OpenAI">🧠 OpenAI (GPT-3.5/GPT-4)</option>
                <option value="Puter.js (Free Zhipu GLM)">🇨🇳 Puter.js (Free Zhipu GLM)</option>
                <option value="OpenRouter">🔀 OpenRouter (Universal AI)</option>
                <option value="RapidAPI (LinkedIn / Job API)">💼 RapidAPI (LinkedIn / Jobs)</option>
                <option value="ScraperAPI">🕷️ ScraperAPI (Web Crawler)</option>
                <option value="Custom">🔧 Custom / Other Provider</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={inputStyle}
              >
                <option value="LLM">🤖 LLM APIs</option>
                <option value="Job API">💼 Job APIs</option>
                <option value="Scraper">🕷️ Scraper APIs</option>
                <option value="Other">🔧 Other APIs</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>API Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Groq Llama Key"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={inputStyle}
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Base URL (Optional)</label>
              <input
                type="url"
                placeholder="https://api.provider.com/v1"
                value={formData.base_url}
                onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Model (Optional)</label>
              <input
                type="text"
                placeholder="e.g. llama-3.1-8b-instant"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Expiration Date (Optional)</label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Quota Limit (Optional)</label>
              <input
                type="number"
                placeholder="e.g. 14400"
                value={formData.daily_quota}
                onChange={(e) => setFormData({ ...formData, daily_quota: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Used Quota (Current Count)</label>
              <input
                type="number"
                placeholder="e.g. 0"
                value={formData.used_quota}
                onChange={(e) => setFormData({ ...formData, used_quota: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Refresh Reset Cycle</label>
              <select
                value={formData.refresh_cycle}
                onChange={(e) => setFormData({ ...formData, refresh_cycle: e.target.value })}
                style={inputStyle}
              >
                <option value="Daily">Daily (00:00 UTC)</option>
                <option value="Monthly">Monthly (1st UTC)</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="Internal usage context or rate-limit notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Save API Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
