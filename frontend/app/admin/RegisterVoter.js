import { useState } from 'react';
import { registerVoter } from '@/contract/Voting';

export default function RegisterVoter({ onRegister }) {
  const [voterAddress, setVoterAddress] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegisterVoter = async () => {
    try {
      setError('');
      setSuccessMessage('');
      const hash = await registerVoter(voterAddress);
      setSuccessMessage(`Votant enregistré avec succès ! Transaction Hash : ${hash}`);
      onRegister();
    } catch (err) {
      setError('Une erreur est survenue lors de l\'enregistrement du votant.');
    }
  };

  return (
    <div>
      <h2>Enregistrer un Votant</h2>
      <input 
        type="text" 
        value={voterAddress} 
        onChange={(e) => setVoterAddress(e.target.value)} 
        placeholder="Adresse du Votant" 
      />
      <button onClick={handleRegisterVoter}>Enregistrer</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
}
