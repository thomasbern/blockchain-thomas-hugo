import { useState, useEffect } from 'react';
import { getVotingStatus, getWinner, getProposals } from '@/contract/Voting';
import { WorkflowStatus } from '@/constants';

export default function GetResults() {
  const [winner, setWinner] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  // Met à jour le statut
  const fetchStatus = async () => {
    try {
      const currentStatus = await getVotingStatus();
      setStatus(currentStatus);
    } catch (err) {
      setError('Erreur lors de la récupération du statut du vote.');
    }
  };

  // Récupère le gagnant et les propositions lorsque le vote est terminé
  const fetchWinnerAndProposals = async () => {
    try {
      if (status === WorkflowStatus.VotesTallied) {
        const winnerId = await getWinner();
        console.log('winnerId', winnerId);  
        setWinner(winnerId);

        const proposalsList = await getProposals();
        setProposals(proposalsList);
      }
    } catch (err) {
      setError('Erreur lors de la récupération des résultats.');
    }
  };

  // Quand le statut change, mettre à jour les résultats
  useEffect(() => {
    const updateResults = async () => {
      await fetchStatus(); // Appel pour mettre à jour le statut
      if (status === WorkflowStatus.VotesTallied) { // Vérifier si le vote est terminé
        await fetchWinnerAndProposals(); // Récupérer les résultats
      }
    };

    updateResults(); // Appeler la fonction d'update dans le useEffect
  }, [status]); // Dépendance sur le statut, il se déclenchera dès qu'il change

  return (
    <div>
      <h1>Section Résultat</h1>
      
      {status === WorkflowStatus.VotesTallied ? (
          <div>
            <h3>Proposition gagnante</h3>
            <p>La proposition gagnante est :</p>
            {proposals[winner] ? (
              <div>
                <p><strong>Description :</strong> {proposals[winner].description}</p>
              </div>
            ) : (
              <p>Les résultats sont en cours de chargement...</p>
            )}
          </div>
      ) : (
        <p>Le vote n'est pas terminé.</p>
      )}
    </div>
  );
}
