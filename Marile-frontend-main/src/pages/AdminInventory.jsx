import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api/axios';

const TYPE_LABELS = {
  restock: { label: 'Restock', color: '#2BAE96', bg: '#e6f5f2' },
  adjustment: { label: 'Penyesuaian', color: '#F58A2E', bg: '#fff3e6' },
  sale: { label: 'Penjualan', color: '#E84040', bg: '#fde8e8' },
  void: { label: 'Void', color: '#7b9590', bg: '#f2f5f4' },
};

const AdminInventory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      params.append('page', page);
      params.append('limit', 20);

      const res = await api.get(`/inventory/logs?${params.toString()}`);
      setLogs(res.data.data.logs || []);
      setPagination(res.data.data.pagination || null);
    } catch (err) {
      console.error('Gagal mengambil inventory log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [typeFilter, page]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div style={{ padding: '0' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="page-title">Riwayat <span style={{ color: 'var(--teal)' }}>Inventori</span></h2>

          {/* Filter Type */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            style={{ padding: '8px 16px', borderRadius: '10px', border: '1.5px solid var(--border)', fontSize: '13px', background: 'white' }}
          >
            <option value="">Semua Aktivitas</option>
            <option value="restock">Restock</option>
            <option value="adjustment">Penyesuaian</option>
            <option value="sale">Penjualan</option>
            <option value="void">Void</option>
          </select>
        </div>

        {/* TABEL */}
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>

          {/* Header Tabel */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.5fr 2fr',
            background: 'var(--teal)',
            color: 'white',
            padding: '14px 20px',
            fontWeight: 700,
            fontSize: '13px'
          }}>
            <div>Produk</div>
            <div>Waktu</div>
            <div>Tipe</div>
            <div>Jumlah</div>
            <div>Oleh</div>
            <div>Catatan</div>
          </div>

          {/* Body Tabel */}
          <div>
            {loading ? (
              <p style={{ padding: '20px', color: 'var(--muted)' }}>Memuat data...</p>
            ) : logs.length === 0 ? (
              <p style={{ padding: '20px', color: 'var(--muted)' }}>Belum ada aktivitas inventori.</p>
            ) : (
              logs.map((log) => {
                const typeInfo = TYPE_LABELS[log.type] || { label: log.type, color: '#333', bg: '#eee' };
                const isNegative = log.quantity < 0;
                return (
                  <div key={log.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.5fr 2fr',
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '13px',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontWeight: 700 }}>{log.product?.name || '-'}</div>
                    <div style={{ color: 'var(--muted)' }}>{formatDate(log.created_at)}</div>
                    <div>
                      <span style={{
                        background: typeInfo.bg,
                        color: typeInfo.color,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: 700,
                        fontSize: '11px'
                      }}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <div style={{
                      fontWeight: 700,
                      color: isNegative ? '#E84040' : '#2BAE96'
                    }}>
                      {isNegative ? '' : '+'}{log.quantity} {log.product?.unit}
                    </div>
                    <div>{log.user?.name || '-'}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{log.note || '-'}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PAGINATION */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'white', cursor: 'pointer', fontWeight: 700 }}
            >
              ← Sebelumnya
            </button>
            <span style={{ padding: '8px 16px', fontWeight: 700, color: 'var(--muted)' }}>
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'white', cursor: 'pointer', fontWeight: 700 }}
            >
              Selanjutnya →
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;