import { CheckCircle, Github, BookOpen, Cloud, Shield, Users, Database, Server, Code, Mail } from 'lucide-react';
import talelPhoto from '../assets/talel.png';
import { useState } from 'react';
import ContactModal from './ContactModal';
import ErrorBoundary from './ErrorBoundary';

export default function LandingPage({ onGoToLogin }) {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="dashboard-container">
      {/* Header / Breadcrumb */}
      <div className="dashboard-header">
        <div className="user-profile-mini">
          <img src={talelPhoto} alt="Talel Chaanbi" className="avatar-circle" />
          <div className="user-info">
            <span className="name">Talel Chaanbi</span>
            <span className="role">Software Engineer</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Left Sidebar / Info */}
        <div className="project-sidebar">
          <div className="community-card">
            <h3>Tech Stack</h3>
            <div className="tech-stack-list">
               <div className="tech-item"><Code size={16} /> React.js</div>
               <div className="tech-item"><Server size={16} /> Node.js & Express</div>
               <div className="tech-item"><Database size={16} /> MongoDB</div>
               <div className="tech-item"><Cloud size={16} /> Azure Cloud</div>
            </div>
          </div>
          
          <div className="course-info">
            <div className="info-item active">
              <CheckCircle size={20} color="#4ade80" />
              <span>Project Completed</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="project-main">
          <div className="project-header">
            <div className="header-top">
              <span className="status-badge submitted">Live Demo</span>
              <h1>MERN Project: Authentication & Roles</h1>
            </div>
            <div className="project-actions">
              <button className="btn-primary" onClick={onGoToLogin}>Accéder à l'application</button>
              <button
                className="btn-ghost btn-mail"
                onClick={() => {
                  console.log('LandingPage: opening contact modal');
                  setContactOpen(true);
                }}
              >
                <Mail size={14} /> Contact / Support
              </button>
              <a className="btn-ghost" href="https://github.com/talelchaanbi/MERNProject" target="_blank" rel="noopener noreferrer"><Github size={16} /> Voir sur GitHub</a>
            </div>
          </div>

          <div className="project-body">
            <section className="objective-section">
              <h2><BookOpen size={20} /> Project Overview</h2>
              <p>
                This application is a comprehensive demonstration of a full-stack MERN (MongoDB, Express, React, Node.js) architecture.
                It features a robust authentication system, role-based access control, and secure data management deployed on the cloud.
              </p>
            </section>

            <section className="features-section">
              <h2>Key Features</h2>
              
              <div className="features-grid">
                <div className="feature-card">
                  <Shield className="feature-icon" size={32} />
                  <h3>Secure Authentication</h3>
                  <p>JWT-based authentication with secure cookie handling and password encryption.</p>
                </div>

                <div className="feature-card">
                  <Users className="feature-icon" size={32} />
                  <h3>Role Management</h3>
                  <p>Distinct roles (Admin, Recruiter, Consultant) with specific permissions and access levels.</p>
                </div>

                <div className="feature-card">
                  <Cloud className="feature-icon" size={32} />
                  <h3>Cloud Deployment</h3>
                  <p>Fully deployed on Microsoft Azure with MongoDB Atlas integration for scalable data storage.</p>
                </div>
              </div>
            </section>

            <section className="submission-section">
              <h2>Source Code</h2>
              <a href="https://github.com/talelchaanbi/MERNProject" target="_blank" rel="noopener noreferrer" className="github-link">
                <Github size={20} />
                View on GitHub
              </a>
            </section>
          </div>
        </div>
      </div>
      <ErrorBoundary>
        <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      </ErrorBoundary>
    </div>
  );
}
