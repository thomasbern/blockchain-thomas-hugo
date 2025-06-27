import { useState } from 'react';
import { startProposalRegistration } from '@/contract/Voting';

export default function StartProposalRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleStartRegistration = async () => {
    try {
      setIsLoading(true);
      setSuccessMessage('');
      setError('');
      const hash = await startProposalRegistration();
      setSuccessMessage(`Session d'enregistrement démarrée avec succès. Hash : ${hash}`);
    } catch (err) {
      setError('Erreur lors du démarrage de la session d\'enregistrement des propositions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Démarrer la session d'enregistrement des propositions</h2>
      <button onClick={handleStartRegistration} disabled={isLoading}>
        {isLoading ? 'Chargement...' : 'Démarrer l\'enregistrement des propositions'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
}
