'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, KeyRound, Database, RefreshCw } from 'lucide-react';
import { DashboardCards } from './components/DashboardCards';
import { ApiTable } from './components/ApiTable';
import { AddApiModal } from './components/AddApiModal';
import { EditApiModal } from './components/EditApiModal';
import { ViewApiModal } from './components/ViewApiModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { TestApiModal } from './components/TestApiModal';
import { supabase } from './supabase';

export default function ApiManagementPanelPage() {
  const [apis, setApis] = useState([]);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Real API Credentials exclusively from Supabase
  const fetchSupabaseApis = async () => {
    setIsLoading(true);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('api_credentials')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setApis(data);
          setIsDbConnected(true);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error('Supabase read error:', err);
      }
    }
    
    setApis([]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSupabaseApis();
  }, []);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingApi, setEditingApi] = useState(null);
  const [viewingApi, setViewingApi] = useState(null);
  const [deletingApi, setDeletingApi] = useState(null);
  const [testingApi, setTestingApi] = useState(null);

  // Handlers with Real Supabase CRUD & Live Quota Updates
  const handleAddApi = async (newApi) => {
    setApis((prev) => [newApi, ...prev]);

    if (supabase) {
      try {
        const { data, error } = await supabase.from('api_credentials').insert([{
          name: newApi.name,
          category: newApi.category,
          provider: newApi.provider,
          api_key: newApi.api_key,
          base_url: newApi.base_url,
          model: newApi.model,
          expiration_date: newApi.expiration_date,
          daily_quota: newApi.daily_quota,
          used_quota: newApi.used_quota || 0,
          refresh_cycle: newApi.refresh_cycle || 'Daily',
          notes: newApi.notes,
          status: newApi.status,
        }]).select();

        if (!error && data && data[0]) {
          fetchSupabaseApis();
        }
      } catch (err) {
        console.error('Supabase insert error:', err);
      }
    }
  };

  const handleEditApi = async (updatedApi) => {
    setApis((prev) => prev.map((a) => (a.id === updatedApi.id ? updatedApi : a)));

    if (supabase) {
      try {
        await supabase
          .from('api_credentials')
          .update({
            api_key: updatedApi.api_key,
            daily_quota: updatedApi.daily_quota,
            used_quota: updatedApi.used_quota,
            refresh_cycle: updatedApi.refresh_cycle,
            expiration_date: updatedApi.expiration_date,
            notes: updatedApi.notes,
            status: updatedApi.status,
            last_updated: new Date().toISOString(),
          })
          .eq('id', updatedApi.id);

        fetchSupabaseApis();
      } catch (err) {
        console.error('Supabase update error:', err);
      }
    }
  };

  const handleIncrementQuota = async (apiId, incrementBy = 1) => {
    setApis((prev) =>
      prev.map((a) => {
        if (a.id === apiId) {
          const currentLimit = Number(a.daily_quota) || 1500;
          const newUsed = (Number(a.used_quota) || 0) + incrementBy;
          const isExceeded = newUsed >= currentLimit;
          return {
            ...a,
            used_quota: newUsed,
            is_exceeded: isExceeded,
            status: isExceeded ? 'Disabled' : a.status,
          };
        }
        return a;
      })
    );

    if (supabase) {
      try {
        const targetApi = apis.find((a) => a.id === apiId);
        if (targetApi) {
          const newUsed = (Number(targetApi.used_quota) || 0) + incrementBy;
          await supabase
            .from('api_credentials')
            .update({
              used_quota: newUsed,
              last_updated: new Date().toISOString(),
            })
            .eq('id', apiId);
        }
      } catch (err) {
        console.error('Supabase update quota error:', err);
      }
    }
  };

  const handleDeleteConfirm = async (id) => {
    setApis((prev) => prev.filter((a) => a.id !== id));
    setDeletingApi(null);

    if (supabase) {
      try {
        await supabase.from('api_credentials').delete().eq('id', id);
        fetchSupabaseApis();
      } catch (err) {
        console.error('Supabase delete error:', err);
      }
    }
  };

  // Search & Quantitative Filtering
  const filteredApis = apis.filter((api) => {
    const matchesSearch =
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.provider.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All' || api.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'All' || api.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const inputStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      padding: '40px 24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={20} />
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.4px' }}>
                API Management Panel
              </h1>
              {isDbConnected ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                  <Database size={12} /> Real Supabase DB
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                  Live Mode
                </span>
              )}
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Store, monitor, and live test free and internal API keys directly from your database.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={fetchSupabaseApis}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontWeight: 600,
                padding: '9px 14px',
                borderRadius: '7px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
              title="Refresh Real DB Data"
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                padding: '9px 16px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Plus size={16} /> Add API Key
            </button>
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <DashboardCards apis={apis} />

        {/* Search & Filter Controls */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by API Name or Provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, width: '100%', paddingLeft: '34px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={inputStyle}
              >
                <option value="All">All Categories</option>
                <option value="LLM">🤖 LLM APIs</option>
                <option value="Job API">💼 Job APIs</option>
                <option value="Scraper">🕷️ Scraper APIs</option>
                <option value="Other">🔧 Other APIs</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={inputStyle}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Table */}
        <ApiTable
          apis={filteredApis}
          onTest={(api) => setTestingApi(api)}
          onView={(api) => setViewingApi(api)}
          onEdit={(api) => setEditingApi(api)}
          onDelete={(api) => setDeletingApi(api)}
        />

        {/* Modals */}
        <AddApiModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSave={handleAddApi}
        />

        <EditApiModal
          isOpen={Boolean(editingApi)}
          onClose={() => setEditingApi(null)}
          api={editingApi}
          onSave={handleEditApi}
        />

        <ViewApiModal
          isOpen={Boolean(viewingApi)}
          onClose={() => setViewingApi(null)}
          api={viewingApi}
        />

        <DeleteConfirmModal
          isOpen={Boolean(deletingApi)}
          onClose={() => setDeletingApi(null)}
          api={deletingApi}
          onConfirm={handleDeleteConfirm}
        />

        <TestApiModal
          isOpen={Boolean(testingApi)}
          onClose={() => setTestingApi(null)}
          api={testingApi}
          onQuotaIncrement={handleIncrementQuota}
        />
      </div>
    </div>
  );
}
