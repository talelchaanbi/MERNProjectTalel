import { Github } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <div className="footer-left">
        <strong>MERN Project</strong>
        <span className="footer-sub">Authentication & Roles</span>
      </div>
      <div className="footer-center">© {year} Talel Chaanbi</div>
      <div className="footer-right">
        <a href="https://github.com/talelchaanbi/MERNProject" target="_blank" rel="noreferrer" className="footer-link">
          <Github size={16} />
          <span>Repo</span>
        </a>
      </div>
    </footer>
  );
}
