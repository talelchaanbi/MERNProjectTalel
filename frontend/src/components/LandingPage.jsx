import { ArrowLeft, CheckCircle, Github, BookOpen, Cloud } from 'lucide-react';

export default function LandingPage({ onGoToLogin }) {
  return (
    <div className="dashboard-container">
      {/* Header / Breadcrumb */}
      <div className="dashboard-header">
        <button className="back-btn">
          <ArrowLeft size={16} />
          Back To My Project List
        </button>
        <div className="user-profile-mini">
          <div className="avatar-circle">TC</div>
          <div className="user-info">
            <span className="name">Talel Chaanbi</span>
            <span className="role">Student</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Left Sidebar / Info */}
        <div className="project-sidebar">
          <div className="community-card">
            <h3>Join the GOMYCODE Community</h3>
            <div className="avatar-group">
               <div className="avatar-stack">
                  <span className="avatar-img" style={{background: '#ffadad'}}>W1</span>
                  <span className="avatar-img" style={{background: '#ffd6a5'}}>M1</span>
                  <span className="avatar-img" style={{background: '#fdffb6'}}>W2</span>
                  <span className="avatar-img" style={{background: '#caffbf'}}>M2</span>
                  <span className="avatar-count">+999</span>
               </div>
            </div>
          </div>
          
          <div className="course-info">
            <div className="info-item">
              <Cloud size={20} />
              <span>Cloud Fundamentals & Deployment</span>
            </div>
            <div className="info-item active">
              <CheckCircle size={20} color="#4ade80" />
              <span>Checkpoint Deployment</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="project-main">
          <div className="project-header">
            <div className="header-top">
              <span className="status-badge submitted">Submitted</span>
              <h1>Checkpoint: Hosting a MERN App on Microsoft Azure</h1>
            </div>
            <button className="btn-primary" onClick={onGoToLogin}>
              Accéder à l'application
            </button>
          </div>

          <div className="project-body">
            <section className="objective-section">
              <h2><BookOpen size={20} /> What You're Aiming For</h2>
              <p><strong>Objective:</strong> To deploy a MERN stack application on Microsoft Azure cloud platform.</p>
            </section>

            <section className="instructions-section">
              <h2>Instructions</h2>
              
              <div className="step-list">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Prepare Your MERN Application</h3>
                    <p>Ensure that your MERN application is fully developed and tested locally. Make sure your application's backend (Node.js/Express) is connected to MongoDB for data storage.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Create a Microsoft Azure Account</h3>
                    <p>If you haven't already, sign up for a Microsoft Azure account. Access the Azure Portal and navigate to the dashboard.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Set Up MongoDB Atlas</h3>
                    <p>Since Azure doesn't offer MongoDB as a service directly, use MongoDB Atlas. Create a new MongoDB cluster and configure it.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h3>Prepare Your MERN App for Deployment</h3>
                    <p>Update configuration to use environment variables. Build your React frontend for production using <code>npm run build</code>.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-number">5</div>
                  <div className="step-content">
                    <h3>Create an Azure Web App Service</h3>
                    <p>In Azure Portal, create a "Web App". Fill in details like app name, resource group, region, and pricing tier.</p>
                  </div>
                </div>

                 <div className="step-item">
                  <div className="step-number">6</div>
                  <div className="step-content">
                    <h3>Set Up Deployment Source</h3>
                    <p>In "Deployment Center", choose "Local Git" or connect to GitHub.</p>
                  </div>
                </div>

                 <div className="step-item">
                  <div className="step-number">7</div>
                  <div className="step-content">
                    <h3>Deploy Your MERN App</h3>
                    <p>Clone the Azure Git repo, copy built frontend files to backend, commit and push.</p>
                  </div>
                </div>

                 <div className="step-item">
                  <div className="step-number">8</div>
                  <div className="step-content">
                    <h3>Configure Environment Variables</h3>
                    <p>In "Configuration", set environment variables (MongoDB connection string, etc.).</p>
                  </div>
                </div>

                 <div className="step-item">
                  <div className="step-number">9</div>
                  <div className="step-content">
                    <h3>Test Your Deployed MERN App</h3>
                    <p>Access your deployed application URL and test functionalities.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="submission-section">
              <h2>Link Submission</h2>
              <a href="https://github.com/talelchaanbi/MERNProject" target="_blank" rel="noopener noreferrer" className="github-link">
                <Github size={20} />
                https://github.com/talelchaanbi/MERNProject
              </a>
              <p className="note">Note: Once your instructor approved the checkpoint, you will no longer be able to change the link.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
