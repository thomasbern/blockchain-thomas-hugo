import { useState } from 'react';
import { tallyVotes } from '@/contract/Voting';

export default function TallyVotes() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleTallyVotes = async () => {
    try {
      setIsLoading(true);
      setSuccessMessage('');
      setError('');
      const hash = await tallyVotes();
      setSuccessMessage(`Votes comptabilisés avec succès. Hash : ${hash}`);
    } catch (err) {
      setError('Erreur lors de la comptabilisation des votes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Resultat du Vote</h1>
      <button onClick={handleTallyVotes} disabled={isLoading}>
        {isLoading ? 'Chargement...' : 'Comptabiliser les votes'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
}
