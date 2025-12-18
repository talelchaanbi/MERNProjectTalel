import { useEffect, useState } from 'react';
import { verifyEmail as verifyEmailService } from '../services/auth';

export default function VerifyPage() {
  const [status, setStatus] = useState('pending'); // pending, success, error
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    async function run() {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const id = params.get('id');
        if (!token || !id) {
          setStatus('error');
          setMessage("Paramètres manquants dans l'URL de vérification.");
          return;
        }

        const res = await verifyEmailService({ token, id });
        setStatus('success');
        setMessage(res.msg || 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.');
      } catch (err) {
        setStatus('error');
        const errMsg = err?.response?.data?.msg || err.message || 'Erreur lors de la vérification.';
        setMessage(errMsg);
      }
    }
    run();
  }, []);

  return (
    <div className="card">
      <h2>Vérification d'email</h2>
      {status === 'pending' && <p>{message}</p>}
      {status === 'success' && (
        <div>
          <p>{message}</p>
          <p>
            <a href="/">Aller à la page d'accueil</a> puis connectez-vous.
          </p>
        </div>
      )}
      {status === 'error' && (
        <div>
          <p className="field-error">{message}</p>
          <p>
            <a href="/">Retour</a>
          </p>
        </div>
      )}
    </div>
  );
}
