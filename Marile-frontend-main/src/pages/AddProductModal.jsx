import React, { useState, useRef } from 'react';
import { X, UploadCloud } from 'lucide-react';
import '../styles/AdminProduct.css';
import api from '../api/axios';

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'protein',
    price: '',
    stock: '',
    unit: 'kg',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('/assets/img/fish.svg');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('unit', formData.unit);
      if (imageFile) data.append('image', imageFile);

      await api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData({ name: '', category: 'protein', price: '', stock: '', unit: 'kg' });
      setImageFile(null);
      setPreview('/assets/img/fish.svg');
      setFileName('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambah produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Tambah <span>Produk Baru</span></h3>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="image-upload-section">
            <div className="image-preview-box">
              <img src={preview} alt="Preview" />
            </div>
            <input type="file" accept="image/*" ref={fileInputRef}
              onChange={handleImageChange} style={{ display: 'none' }} />
            <button type="button" className="btn-upload-trigger"
              onClick={() => fileInputRef.current.click()}>
              <UploadCloud size={16} />
              {fileName ? 'Ganti Foto' : 'Unggah Foto Produk'}
            </button>
            {fileName && <span className="file-name-text">{fileName}</span>}
          </div>

          {error && <p style={{ color: 'red', fontSize: '13px' }}>{error}</p>}

          <div className="form-grid">
            <div className="input-group">
              <label>Nama Produk</label>
              <input type="text" value={formData.name} required
                placeholder="Contoh: Ikan Bandeng"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Kategori</label>
              <select value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="protein">Protein</option>
                <option value="sayur">Sayur</option>
                <option value="buah">Buah</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div className="input-group">
              <label>Harga (Rp)</label>
              <input type="number" value={formData.price} required placeholder="50000"
                onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Jumlah Stok</label>
              <input type="number" value={formData.stock} required placeholder="10"
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Satuan</label>
              <select value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                <option value="kg">kg</option>
                <option value="pcs">pcs</option>
                <option value="ekor">ekor</option>
                <option value="ikat">ikat</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">Batal</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;