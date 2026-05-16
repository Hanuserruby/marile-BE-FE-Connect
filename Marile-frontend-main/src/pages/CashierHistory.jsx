import React, { useState, useEffect } from 'react';
import CashierLayout from '../components/CashierLayout';
import '../styles/CashierHistory.css';
import { X, ShoppingBag, Printer } from 'lucide-react';
import api from '../api/axios';

const CashierHistory = () => {
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [timeFilter, setTimeFilter] = useState('today');
  const [sortOrder, setSortOrder] = useState('Terbaru');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/transactions?period=${timeFilter}`);
      let data = res.data.data.transactions || [];
      if (sortOrder === 'Terbaru') {
        data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else {
        data = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      }
      setTransactions(data);
    } catch (err) {
      console.error('Gagal mengambil transaksi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [timeFilter, sortOrder]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

  const closeModal = () => setSelectedTrx(null);

  return (
    <CashierLayout>
      <div className="history-page-content">

        {/* HEADER & FILTERS */}
        <div className="history-header-row">
          <h2>Riwayat Transaksi</h2>
          <div className="history-actions-container">
            <div className="filter-item">
              <select className="history-dropdown" value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}>
                <option value="today">Hari ini</option>
                <option value="week">Minggu ini</option>
                <option value="month">Bulan ini</option>
              </select>
            </div>
            <div className="filter-item sort-wrapper">
              <span className="sort-label">Urutkan:</span>
              <select className="history-dropdown" value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}>
                <option value="Terbaru">Terbaru</option>
                <option value="Terlama">Terlama</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABEL */}
        <div className="history-table-container">
          <div className="history-table-header">
            <div>Id Transaksi</div>
            <div>Tanggal & Waktu</div>
            <div>Pembayaran</div>
            <div>Item</div>
            <div>Total Harga</div>
            <div>Status</div>
            <div className="text-center">Aksi</div>
          </div>

          <div className="history-table-body">
            {loading ? (
              <p style={{ padding: '20px' }}>Memuat data...</p>
            ) : transactions.length === 0 ? (
              <p style={{ padding: '20px', color: 'var(--muted)' }}>Belum ada transaksi.</p>
            ) : (
              transactions.map((trx) => (
                <div className="history-table-row" key={trx.id}>
                  <div className="font-bold">{trx.invoice_no}</div>
                  <div>{formatDate(trx.created_at)}</div>
                  <div>{trx.payment_method}</div>
                  <div>{trx.transactionItems?.length || 0} item</div>
                  <div className="font-bold">{formatRupiah(trx.total)}</div>
                  <div className={trx.status === 'completed' ? 'status-selesai' : 'status-batal'}>
                    {trx.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                  </div>
                  <div className="action-col">
                    <button className="action-btn" onClick={() => setSelectedTrx(trx)}>⋮</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MODAL DETAIL */}
        {selectedTrx && (
          <div className="history-modal-overlay" onClick={closeModal}>
            <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="history-modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
              <div className="history-modal-header">
                <h3>Detail Transaksi</h3>
                <span className="trx-id-badge">{selectedTrx.invoice_no}</span>
              </div>
              <div className="history-modal-body">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Waktu Transaksi</label>
                    <p>{formatDate(selectedTrx.created_at)}</p>
                  </div>
                  <div className="info-item text-right">
                    <label>Metode Pembayaran</label>
                    <p><strong>{selectedTrx.payment_method}</strong></p>
                  </div>
                </div>

                <div className="detail-items-box">
                  <div className="detail-items-header">
                    <ShoppingBag size={14} /> <span>Daftar Produk</span>
                  </div>
                  <div className="items-list">
                    {(selectedTrx.transactionItems || []).length > 0 ? (
                      selectedTrx.transactionItems.map((item, i) => (
                        <div className="item-row" key={i}>
                          <span className="item-name">{item.product_name}</span>
                          <span className="item-qty">x{item.quantity}</span>
                          <span className="item-subtotal">{formatRupiah(item.sub_total)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="no-detail">Detail produk tidak tersedia.</p>
                    )}
                  </div>
                </div>

                <div className="detail-total-section">
                  <div className="total-row">
                    <span>Total Bayar</span>
                    <span className="total-val">{formatRupiah(selectedTrx.total)}</span>
                  </div>
                </div>
              </div>

              <div className="history-modal-footer">
                <button className="btn-print-receipt">
                  <Printer size={16} /> CETAK ULANG NOTA
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CashierLayout>
  );
};

export default CashierHistory;