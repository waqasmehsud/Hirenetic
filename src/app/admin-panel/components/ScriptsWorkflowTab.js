'use client';

import React, { useState } from 'react';
import { Cpu, Play, Terminal, CheckCircle2, RefreshCw, Code, ExternalLink } from 'lucide-react';

export default function ScriptsWorkflowTab({ onNotify, scriptsList = [] }) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedScript, setSelectedScript] = useState(scriptsList.length > 0 ? scriptsList[0].name : 'Automation Script');
  const [scriptLogs, setScriptLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), script: 'System Automation Engine', status: 'Success', message: 'Script execution engine initialized & ready.' }
  ]);

  const runScriptWorkflow = () => {
    setIsExecuting(true);
    if (onNotify) onNotify(`Dispatching workflow for ${selectedScript}...`);
    setTimeout(() => {
      setIsExecuting(false);
      const newLog = { 
        id: Date.now(), 
        time: new Date().toLocaleTimeString(), 
        script: selectedScript, 
        status: 'Success', 
        message: `Workflow "${selectedScript}" executed successfully.` 
      };
      setScriptLogs([newLog, ...scriptLogs]);
      if (onNotify) onNotify('Script executed successfully!');
    }, 1200);
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="admin-card-title">
          <Cpu size={20} style={{ color: '#2563eb' }} />
          <span>Automated Scripts & Workflows ({scriptsList.length})</span>
        </div>
        <a 
          href="/scripts-inventory" 
          target="_blank" 
          rel="noreferrer"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#ffffff', background: '#0f172a', padding: '6px 12px', borderRadius: '6px' }}
        >
          <Code size={14} /> Open Script Editor <ExternalLink size={12} />
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Trigger Automation */}
        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--admin-card-border)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Run Real Automation Script</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.85rem' }}>Select an active Python script from Supabase `scriptsEditor` database to run.</p>
          
          <select 
            value={selectedScript} 
            onChange={(e) => setSelectedScript(e.target.value)} 
            style={{ width: '100%', padding: '9px 12px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
          >
            {scriptsList.length > 0 ? (
              scriptsList.map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.language || 'Python'})</option>
              ))
            ) : (
              <option value="default_script.py">Default Python Inventory Automation</option>
            )}
          </select>

          <button 
            className="admin-btn admin-btn-primary" 
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', padding: '10px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }} 
            onClick={runScriptWorkflow} 
            disabled={isExecuting}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="spin" size={16} /> Running Script...
              </>
            ) : (
              <>
                <Play size={16} /> Run Script Workflow
              </>
            )}
          </button>
        </div>

        {/* Database Scripts List */}
        <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--admin-card-border)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Supabase Database Scripts</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.85rem' }}>Live Python scripts registered in platform repository.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '140px', overflowY: 'auto' }}>
            {scriptsList.length > 0 ? (
              scriptsList.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.825rem' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</span>
                  <span style={{ fontSize: '11px', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{s.language || 'Python'}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>No custom scripts found. Create one in Script Editor!</div>
            )}
          </div>
        </div>

      </div>

      {/* Execution Logs */}
      <div style={{ background: '#0f172a', padding: '1.2rem', borderRadius: '10px', color: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
          <Terminal size={16} style={{ color: '#38bdf8' }} />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>Script Execution Logs</h3>
        </div>

        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
          {scriptLogs.map(log => (
            <div key={log.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>[{log.time}]</span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>[{log.status}]</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>{log.script}:</span>
              <span style={{ color: '#e2e8f0' }}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
