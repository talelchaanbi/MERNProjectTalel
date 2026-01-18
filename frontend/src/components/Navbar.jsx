import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Github, User, LogOut, MoreVertical } from 'lucide-react';
import { fetchMessageCounts } from '../api/messages';
import { fetchUnreadCount } from '../api/notifications';

export default function Navbar({ user, logout, setView, currentView }) {
  // Prefer showing the user's last name (nom) as a friendly greeting.
  const getDisplayName = () => {
    if (!user) return '';
    const full = String(user.username || user.name || user.email || '');
    const parts = full.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      const last = parts[parts.length - 1];
      return last.charAt(0).toUpperCase() + last.slice(1);
    }
    if (full.includes('@')) return full.split('@')[0];
    return full;
  };

  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('app:theme');
      if (stored) return stored === 'dark';
    } catch (e) {}
    return document.body.classList.contains('dark');
  });

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('app:theme', isDark ? 'dark' : 'light');
    } catch (e) {}
  }, [isDark]);

  // dropdown menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [counts, setCounts] = useState({ total: 0, urgent: 0, unread: 0 });
  const [notifCount, setNotifCount] = useState(0);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const menuRef = useRef(null);
  const countsRef = useRef(null);
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // fetch counts for admins and poll
  useEffect(() => {
    let mounted = true;
    let timer = null;
    const loadCounts = async () => {
      try {
        const c = await fetchMessageCounts();
        if (!mounted) return;
        setCounts(c || { total: 0, urgent: 0, unread: 0 });
      } catch (e) {
        // ignore
      }
    };
    const loadNotif = async () => {
      try {
        const res = await fetchUnreadCount();
        if (!mounted) return;
        setNotifCount(res?.unread || 0);
      } catch (e) {}
    };
    if (user && user.role === 'ADMIN') {
      loadCounts();
      timer = setInterval(loadCounts, 20000);
    }
    if (user) {
      loadNotif();
      timer = setInterval(() => {
        loadNotif();
        if (user.role === 'ADMIN') loadCounts();
      }, 20000);
    }
    // listen for immediate updates triggered elsewhere
    function onUpdated(e) {
      if (e?.detail) setCounts(e.detail);
      else loadCounts();
    }
    function onMessageRead(e) {
      // decrement unread immediately when an individual message is marked read
      setCounts((c) => ({ ...c, unread: Math.max(0, (c.unread || 0) - 1) }));
    }
    window.addEventListener('messages:updated', onUpdated);
    window.addEventListener('message:read', onMessageRead);
    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
      window.removeEventListener('messages:updated', onUpdated);
      window.removeEventListener('message:read', onMessageRead);
    };
  }, [user]);

  return (
    <nav className="navbar creative">
      <div className="navbar-left" onClick={() => setView('dashboard')} role="button" tabIndex={0}>
        <div className="brand-logo">Talel Chaanbi<span className="brand-dot">•</span></div>
        <div className="brand-sub">MERN · Auth & Roles</div>
      </div>

      <button className="hamburger" aria-label="Ouvrir le menu mobile" onClick={() => setMobileOpen(s => !s)}>
        <MoreVertical size={18} />
      </button>

      <div className={`navbar-menu ${mobileOpen ? 'open' : ''}`}>
        <button 
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setView('dashboard')}
        >
          Tableau de bord
        </button>
        <button
          className={`nav-item ${currentView === 'jobs' ? 'active' : ''}`}
          onClick={() => setView('jobs')}
        >
          Offres
        </button>
        <button
          className={`nav-item ${currentView === 'social' ? 'active' : ''}`}
          onClick={() => setView('social')}
        >
          Fil d'actualité
        </button>
        <button
          className={`nav-item ${currentView === 'connections' ? 'active' : ''}`}
          onClick={() => setView('connections')}
        >
          Réseau
        </button>
        <button
          className={`nav-item ${currentView === 'chat' ? 'active' : ''}`}
          onClick={() => setView('chat')}
        >
          Messages
        </button>
        <button
          className={`nav-item ${currentView === 'notifications' ? 'active' : ''}`}
          onClick={() => setView('notifications')}
          aria-label={`Notifications, ${notifCount} non lues`}
        >
          Notifications {notifCount > 0 && (
            <span className="nav-badge" role="status" aria-live="polite">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>
        {user && user.role === 'CONSULTANT' && (
          <button
            className={`nav-item ${currentView === 'applications' ? 'active' : ''}`}
            onClick={() => setView('applications')}
          >
            Mes candidatures
          </button>
        )}
        {(user && (user.role === 'RECRUT' || user.role === 'ADMIN')) && (
          <button
            className={`nav-item ${currentView === 'job-applications' ? 'active' : ''}`}
            onClick={() => setView('job-applications')}
          >
            Candidatures
          </button>
        )}
        {user && user.role === 'ADMIN' && (
          <>
            <button 
              className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
              onClick={() => setView('users')}
            >
              Utilisateurs
            </button>
            <button
              className={`nav-item ${currentView === 'messages' ? 'active' : ''}`}
              onClick={() => setView('messages')}
              aria-label={`Messages, ${counts.unread || 0} non lus`}
            >
              Messages {counts.unread > 0 && (
                <span
                  className="nav-badge"
                  title={`${counts.unread} message(s) en attente`}
                  role="status"
                  aria-live="polite"
                >
                  {counts.unread > 9 ? '9+' : counts.unread}
                </span>
              )}
            </button>
            <button 
              className={`nav-item ${currentView === 'register' ? 'active' : ''}`}
              onClick={() => setView('register')}
            >
              Créer un compte
            </button>
          </>
        )}
      </div>

      <div className="navbar-end creative-end">
        <div className="welcome-block">
          <span className="welcome">Bonjour {getDisplayName()}</span>
          <span className="welcome-sub">{user?.role}</span>
        </div>

        <div className="navbar-actions">
          <a href="https://github.com/talelchaanbi/MERNProject" target="_blank" rel="noreferrer" className="icon-btn" title="Repository">
            <Github size={18} />
          </a>

          <button className="icon-btn" onClick={() => setIsDark(!isDark)} title="Toggle theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="user-menu" ref={menuRef}>
            <button className="icon-btn avatar-btn" onClick={() => setMenuOpen((s) => !s)} title="Menu">
              {user.profilePicture && !avatarBroken ? (
                <img src={user.profilePicture} alt={user.username} className="avatar-in-menu" onError={() => setAvatarBroken(true)} onLoad={() => setAvatarBroken(false)} />
              ) : (
                <div className="avatar-initials">{(user.username || user.email || '?').toString().trim().split(/\s+/).slice(-1)[0]?.[0]?.toUpperCase()}</div>
              )}
            </button>
            {menuOpen && (
              <div className="menu-dropdown" role="menu" aria-label="Menu utilisateur">
                <button className="menu-item" role="menuitem" onClick={() => { setMenuOpen(false); setView('dashboard'); }}>
                  <User size={16} /> Mon profil
                </button>
                <button className="menu-item" role="menuitem" onClick={() => { setMenuOpen(false); logout(); }}>
                  <LogOut size={16} /> Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

