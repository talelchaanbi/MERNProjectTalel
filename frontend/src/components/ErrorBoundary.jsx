import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // log to console for now
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card error-message">
          <h3>Une erreur est survenue</h3>
          <p>Impossible d'afficher le formulaire de contact pour le moment. Veuillez réessayer plus tard.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
