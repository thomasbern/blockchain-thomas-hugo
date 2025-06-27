import { useState, useEffect } from 'react';

import VoteSection from './VoteSection';
import SubmitProposal from './SubmitProposal';

import { getProposals } from '@/contract/Voting';

export default function VoterDashboard() {
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const proposalsData = await getProposals();
        console.log(proposalsData);
        setProposals(proposalsData);
      } catch (err) {
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Section Votant</h1>

      {loading ? (
        <p>Chargement des données...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div style={gridStyle}>

          {/* Section pour consulter les propositions */}
          <div style={cardStyle}>
            <SubmitProposal proposals={proposals} />
          </div>

          {/* Section pour voter */}
          <div style={cardStyle}>
            <VoteSection proposals={proposals} />
          </div>

        </div>
      )}
    </div>
  );
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)', // Crée une grille 3x3
  gap: '1rem',
  marginTop: '2rem',
}

// Style pour chaque carte
const cardStyle = {
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Ombre autour des éléments
  padding: '1rem', // Padding pour espacer le contenu
  backgroundColor: '#fff', // Fond blanc pour chaque carte
  transition: 'transform 0.3s ease', // Transition douce pour les effets au survol
};
