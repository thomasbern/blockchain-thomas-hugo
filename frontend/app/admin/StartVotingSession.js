import { useState } from 'react';
import { startVotingSession } from '@/contract/Voting';

export default function StartVotingSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleStartVotingSession = async () => {
    try {
      setIsLoading(true);
      setSuccessMessage('');
      setError('');
      const hash = await startVotingSession();
      setSuccessMessage(`Session de vote démarrée avec succès. Hash : ${hash}`);
    } catch (err) {
      setError('Erreur lors du démarrage de la session de vote.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Démarrer la session de vote</h2>
      <button onClick={handleStartVotingSession} disabled={isLoading}>
        {isLoading ? 'Chargement...' : 'Démarrer la session de vote'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
}
