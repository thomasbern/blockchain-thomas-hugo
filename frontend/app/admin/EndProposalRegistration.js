import { useState } from 'react';
import { endProposalRegistration } from '@/contract/Voting';

export default function EndProposalRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleEndRegistration = async () => {
    try {
      setIsLoading(true);
      setSuccessMessage('');
      setError('');
      const hash = await endProposalRegistration();
      setSuccessMessage(`Session d'enregistrement terminée avec succès. Hash : ${hash}`);
    } catch (err) {
      setError('Erreur lors de la fin de la session d\'enregistrement des propositions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Mettre fin à la session d'enregistrement des propositions</h2>
      <button onClick={handleEndRegistration} disabled={isLoading}>
        {isLoading ? 'Chargement...' : 'Mettre fin à l\'enregistrement'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
}
