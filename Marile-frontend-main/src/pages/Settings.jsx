import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import CashierLayout from '../components/CashierLayout';
import '../styles/Settings.css';
import api from '../api/axios';

const Settings = ({ role = "Admin" }) => {
  const [activeMenu, setActiveMenu] = useState('profil');
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [userId, setUserId] = useState(null);
  const [profileData, setProfileData] = useState({ name: '', username: '' });
  const [passwordData, setPasswordData] = useState({
    current_password: '', new_password: '', confirm_password: ''
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const Layout = role === "Admin" ? AdminLayout : CashierLayout;

  // Ambil data user yang sedang login
  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        const user = res.data.data.user;
        setUserId(user.id);
        setProfileData({ name: user.name, username: user.username });
      })
      .catch(err => console.error('Gagal ambil data user:', err));
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSaveProfil = async () => {
    setLoading(true);
    setProfileMsg('');
    setProfileError('');
    try {
      await api.put(`/users/${userId}`, {
        name: profileData.name,
        username: profileData.username,
      });
      setProfileMsg('Profil berhasil diperbarui!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordMsg('');
    setPasswordError('');
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Password baru dan konfirmasi tidak cocok!');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/users/${userId}/password`, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordMsg('Password berhasil diubah!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'profil':
        return (
          <div className="settings-card-content">
            <div className="settings-header-inner">
              <h3>Profil {role}</h3>
              <p className="subtitle">Kelola informasi akun {role.toLowerCase()} Anda</p>
            </div>
            <div className="profile-settings-container">
              <div className="avatar-section">
                <p className="label-bold">Foto Profil</p>
                <div className="avatar-placeholder">
                  <span>{profileData.name.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="form-section">
                {profileMsg && <p style={{ color: 'green', fontSize: '13px' }}>{profileMsg}</p>}
                {profileError && <p style={{ color: 'red', fontSize: '13px' }}>{profileError}</p>}
                <div className="input-group">
                  <label>Nama Lengkap</label>
                  <input type="text" name="name" value={profileData.name}
                    onChange={handleProfileChange} placeholder="Masukkan nama lengkap" />
                </div>
                <div className="input-group">
                  <label>Username</label>
                  <input type="text" name="username" value={profileData.username}
                    onChange={handleProfileChange} placeholder="Masukkan username" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifikasi':
        return (
          <div className="settings-card-content">
            <h3>Pengaturan Notifikasi</h3>
            <div className="notification-list">
              {[
                { title: "Pesanan Baru", desc: "Dapatkan notifikasi ketika pesanan baru masuk" },
                { title: "Pembayaran Masuk", desc: "Dapatkan notifikasi ketika pembayaran berhasil" },
                { title: "Stok Produk Menipis", desc: "Dapatkan notifikasi ketika stok hampir habis" },
                { title: "Update Sistem", desc: "Dapatkan informasi update terbaru" },
              ].map((item, idx) => (
                <div className="notif-item" key={idx}>
                  <div className="notif-text">
                    <p className="notif-title">{item.title}</p>
                    <p className="notif-desc">{item.desc}</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked={idx !== 3} />
                    <span className="slider round"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'keamanan':
        return (
          <div className="settings-card-content">
            <h3>Keamanan Akun</h3>
            <div className="password-form">
              {passwordMsg && <p style={{ color: 'green', fontSize: '13px' }}>{passwordMsg}</p>}
              {passwordError && <p style={{ color: 'red', fontSize: '13px' }}>{passwordError}</p>}
              {[
                { label: 'Password Lama', key: 'old', name: 'current_password' },
                { label: 'Password Baru', key: 'new', name: 'new_password' },
                { label: 'Konfirmasi Password', key: 'confirm', name: 'confirm_password' },
              ].map(({ label, key, name }) => (
                <div className="input-group" key={key}>
                  <label>{label}</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword[key] ? "text" : "password"}
                      name={name}
                      value={passwordData[name]}
                      onChange={handlePasswordChange}
                      placeholder={`Masukkan ${label.toLowerCase()}`}
                    />
                    <button type="button" className="btn-toggle-eye"
                      onClick={() => setShowPassword({ ...showPassword, [key]: !showPassword[key] })}>
                      {showPassword[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="info-box-teal">
                <Shield size={20} />
                <p>Gunakan minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, dan angka.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="settings-page-content">
        <div className="settings-sidebar-nav">
          <h3>Menu Pengaturan</h3>
          <div className="menu-list">
            <button className={`menu-item-btn ${activeMenu === 'profil' ? 'active' : ''}`}
              onClick={() => setActiveMenu('profil')}>
              <div className="icon-wrapper"><User size={20} /></div>
              <div className="menu-info">
                <p className="menu-title">Profil {role}</p>
                <p className="menu-subtitle">Informasi pribadi</p>
              </div>
            </button>
            <button className={`menu-item-btn ${activeMenu === 'notifikasi' ? 'active' : ''}`}
              onClick={() => setActiveMenu('notifikasi')}>
              <div className="icon-wrapper"><Bell size={20} /></div>
              <div className="menu-info">
                <p className="menu-title">Notifikasi</p>
                <p className="menu-subtitle">Atur peringatan</p>
              </div>
            </button>
            <button className={`menu-item-btn ${activeMenu === 'keamanan' ? 'active' : ''}`}
              onClick={() => setActiveMenu('keamanan')}>
              <div className="icon-wrapper"><Shield size={20} /></div>
              <div className="menu-info">
                <p className="menu-title">Keamanan</p>
                <p className="menu-subtitle">Kata sandi & akun</p>
              </div>
            </button>
          </div>
        </div>

        <div className="settings-main-container">
          <div className="settings-scroll-area">
            {renderContent()}
          </div>
          <div className="settings-action-footer">
            <button className="btn-cancel" onClick={() => window.location.reload()}>Batalkan</button>
            <button className="btn-save-settings" disabled={loading}
              onClick={activeMenu === 'keamanan' ? handleSavePassword : handleSaveProfil}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;