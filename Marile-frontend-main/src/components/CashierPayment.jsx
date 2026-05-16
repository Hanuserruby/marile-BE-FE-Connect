import React, { useState, useEffect } from 'react';
import { X, Banknote, QrCode, ShoppingBag } from 'lucide-react';
import '../styles/CashierPayment.css';
import api from '../api/axios';

const CashierPayment = ({ isOpen, onClose, totalAmount = 0, cartItems = [], onComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [showQrisBarcode, setShowQrisBarcode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('Cash');
      setAmountPaid('');
      setShowQrisBarcode(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const safeTotalAmount = typeof totalAmount === 'string'
    ? parseInt(totalAmount.replace(/[^0-9]/g, ''), 10) || 0
    : totalAmount;

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID').format(number);
  const amountPaidNumber = parseInt(amountPaid) || 0;
  const kembalian = amountPaidNumber - safeTotalAmount;

  const handleNumpadClick = (value) => {
    if (value === '=') {
      processPayment();
    } else if (value === 'Hapus') {
      setAmountPaid((prev) => prev.toString().slice(0, -1));
    } else {
      setAmountPaid((prev) => (prev === '0' ? value : prev + value));
    }
  };

  const processPayment = async () => {
    setError('');
    if (paymentMethod === 'Qris') {
      setShowQrisBarcode(true);
      return;
    }

    if (amountPaidNumber < safeTotalAmount) {
      setError('Nominal pembayaran kurang!');
      return;
    }

    setLoading(true);
    try {
      const items = cartItems.map((item) => ({
        productsId: item.id,
        quantity: item.qty,
      }));

      await api.post('/transactions', {
        items,
        payment_method: paymentMethod,
        amount_paid: amountPaidNumber,
      });

      if (onComplete) onComplete(kembalian);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses transaksi');
    } finally {
      setLoading(false);
    }
  };

  const processQrisPayment = async () => {
    setLoading(true);
    setError('');
    try {
      const items = cartItems.map((item) => ({
        productsId: item.id,
        quantity: item.qty,
      }));

      await api.post('/transactions', {
        items,
        payment_method: 'Qris',
        amount_paid: safeTotalAmount,
      });

      if (onComplete) onComplete(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses transaksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className={`payment-modal-content ${showQrisBarcode ? 'qris-mode' : ''}`}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} strokeWidth={3} />
        </button>

        {showQrisBarcode ? (
          <div className="qris-barcode-container">
            <h2>QRIS Pembayaran</h2>
            <p className="qris-total">Total: Rp {formatRupiah(safeTotalAmount)}</p>
            <div className="barcode-placeholder">
              <QrCode size={180} color="#162421" />
            </div>
            <p className="qris-instruction">Silahkan scan barcode di atas</p>
            {error && <p style={{ color: 'red', fontSize: '13px' }}>{error}</p>}
            <button className="btn-action" onClick={processQrisPayment} disabled={loading}>
              {loading ? 'Memproses...' : 'KONFIRMASI SELESAI'}
            </button>
          </div>
        ) : (
          <>
            <h2 className="modal-title">Pembayaran</h2>
            <div className="payment-modal-body">
              <div className="payment-left-col">
                <div className="order-summary-box">
                  <div className="summary-header">
                    <ShoppingBag size={16} />
                    <span>Rincian Pesanan ({cartItems.length})</span>
                  </div>
                  <div className="summary-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="summary-item">
                        <span className="summary-name">{item.name}</span>
                        <span className="summary-qty">x{item.qty}</span>
                        <span className="summary-price">
                          Rp {(item.price * item.qty).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="method-selector">
                  <button
                    className={`method-card ${paymentMethod === 'Cash' ? 'active' : ''}`}
                    onClick={() => { setPaymentMethod('Cash'); setAmountPaid(''); }}
                  >
                    <Banknote size={24} />
                    <span>Tunai</span>
                  </button>
                  <button
                    className={`method-card ${paymentMethod === 'Qris' ? 'active' : ''}`}
                    onClick={() => { setPaymentMethod('Qris'); setAmountPaid(''); }}
                  >
                    <QrCode size={24} />
                    <span>QRIS</span>
                  </button>
                </div>

                <div className="payment-inputs">
                  <div className="total-display">
                    <label>Total Tagihan</label>
                    <div className="val">Rp {formatRupiah(safeTotalAmount)}</div>
                  </div>

                  {paymentMethod === 'Cash' && (
                    <div className="paid-input-group">
                      <input
                        type="text"
                        value={amountPaid ? `Rp ${formatRupiah(amountPaidNumber)}` : ''}
                        readOnly
                        placeholder="Rp 0"
                        className="input-amount"
                      />
                      {amountPaidNumber > 0 && (
                        <div className={`change-info ${kembalian >= 0 ? 'success' : 'danger'}`}>
                          <span>{kembalian >= 0 ? 'Kembalian' : 'Kurang'}</span>
                          <strong>Rp {formatRupiah(Math.abs(kembalian))}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {error && <p style={{ color: 'red', fontSize: '13px' }}>{error}</p>}

                  <button className="btn-action" onClick={processPayment} disabled={loading}>
                    {loading ? 'Memproses...' : paymentMethod === 'Cash' ? 'CETAK NOTA' : 'TAMPILKAN QRIS'}
                  </button>
                </div>
              </div>

              <div className="numpad-grid">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', 'Hapus', '='].map((num) => (
                  <button
                    key={num}
                    className={`numpad-btn ${num === '=' ? 'btn-equals' : ''} ${num === 'Hapus' ? 'btn-clear' : ''}`}
                    onClick={() => handleNumpadClick(num)}
                    disabled={paymentMethod === 'Qris'}
                  >
                    {num === 'Hapus' ? '⌫' : num}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CashierPayment;