import React from 'react';
import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-left">
        <div className="brand">MERN Project <span className="brand-dot">•</span></div>
        <div className="footer-sub">Talel Chaanbi — MERN Full‑Stack</div>
      </div>
      <div className="footer-center">&copy; {new Date().getFullYear()} — Demo project</div>
      <div className="footer-right">
        <a className="footer-link" href="https://github.com/talelchaanbi/MERNProject" target="_blank" rel="noopener noreferrer"><Github size={16} /> Source</a>
      </div>
    </footer>
  );
}
