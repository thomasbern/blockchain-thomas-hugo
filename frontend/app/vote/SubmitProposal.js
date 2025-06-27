import { useState } from 'react';
import { submitProposal } from '@/contract/Voting';  // Fonction pour soumettre une proposition

export default function SubmitProposal({ onProposalSubmit }) {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmitProposal = async () => {
    try {
      setError('');
      setSuccessMessage('');

      if (!description || description.length === 0) {
        setError('La description de la proposition ne peut pas être vide.');
        return;
      }

      // Soumettre la proposition via le contrat
      const hash = await submitProposal(description);
      setSuccessMessage(`Proposition soumise avec succès ! Transaction Hash : ${hash}`);
      onProposalSubmit();
    } catch (err) {
      setError('Une erreur est survenue lors de la soumission de la proposition.');
    }
  };

  return (
    <div>
      <h2>Soumettre une Proposition</h2>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description de la proposition"
      />
      
      <button onClick={handleSubmitProposal}>Soumettre la Proposition</button>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
}
