import { useState } from 'react';
import { vote } from '@/contract/Voting'; // Fonction à définir dans le contrat

export default function VoteSection({ proposals }) {
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleVote = async () => {
    try {
      setError('');
      setSuccessMessage('');

      if (selectedProposalId === null) {
        setError('Vous devez sélectionner une proposition.');
        return;
      }

      const hash = await vote(selectedProposalId);
      setSuccessMessage(`Vote effectué avec succès ! Transaction Hash : ${hash}`);
    } catch (err) {
      setError('Une erreur est survenue lors du vote.');
    }
  };

  return (
    <div>
      <h2>Votez pour une Proposition</h2>
      <select onChange={(e) => setSelectedProposalId(e.target.value)} value={selectedProposalId}>
        <option value="">Sélectionner une proposition</option>
        {proposals.map((proposal, index) => (
          <option key={index} value={index}>
            {proposal.description}
          </option>
        ))}
      </select>
      <button onClick={handleVote}>Voter</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
}
