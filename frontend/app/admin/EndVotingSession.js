import { useState } from 'react';
import { endVotingSession } from '@/contract/Voting';

export default function EndVotingSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleEndVotingSession = async () => {
    try {
      setIsLoading(true);
      setSuccessMessage('');
      setError('');
      const hash = await endVotingSession();
      setSuccessMessage(`Session de vote terminée avec succès. Hash : ${hash}`);
    } catch (err) {
      setError('Erreur lors de la fin de la session de vote.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Mettre fin à la session de vote</h2>
      <button onClick={handleEndVotingSession} disabled={isLoading}>
        {isLoading ? 'Chargement...' : 'Mettre fin à la session de vote'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
}
