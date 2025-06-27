import React, { useEffect, useState } from 'react';
import StartProposalRegistration from './StartProposalRegistration';
import EndProposalRegistration from './EndProposalRegistration';
import StartVotingSession from './StartVotingSession';
import EndVotingSession from './EndVotingSession';
import TallyVotes from './TallyVotes';
import RegisterVoter from './RegisterVoter';
import { getVoters, getProposals } from '@/contract/Voting';

export default function AdminDashboard() {
  const [voters, setVoters] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [status, setStatus] = useState(null);

  const fetchVoters = async () => {
    try {
      const votersList = await getVoters();
      setVoters(votersList);
    } catch (err) {
      console.error("Erreur lors de la récupération des votants", err);
    }
  };

  const fetchProposals = async () => {
    try {
      const proposalsList = await getProposals();
      setProposals(proposalsList);
    } catch (err) {
      console.error("Erreur lors de la récupération des propositions", err);
    }
  };

  useEffect(() => {
    fetchVoters();
    fetchProposals();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Section Administrateur</h1>

      {/* Grille 3x3 pour le tableau de bord */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',  // Crée une grille 3x3
          gap: '1rem',  // Espacement entre les éléments
          marginTop: '2rem',  // Marge au-dessus de la grille
        }}
      >
        <div style={cardStyle}>
          <RegisterVoter onRegister={fetchVoters} />
        </div>
        <div style={cardStyle}>
          <StartProposalRegistration />
        </div>
        <div style={cardStyle}>
          <EndProposalRegistration />
        </div>
        <div style={cardStyle}>
          <StartVotingSession />
        </div>
        <div style={cardStyle}>
        <EndVotingSession  />
        </div>
        <div style={cardStyle}>
          <TallyVotes />
        </div>

      </div>

      {/* Liste des votants */}
      <div style={cardStyle}>
        <h2>Liste des Votants Enregistrés</h2>
        <ul>
          {voters.length > 0 ? (
            voters.map((voter, index) => (
              <li key={index}>{voter}</li>
            ))
          ) : (
            <p>Aucun votant enregistré.</p>
          )}
        </ul>
      </div>

      {/* Liste des propositions */}
      <div style={cardStyle}>
        <h2>Liste des Propositions</h2>
        <ul>
          {proposals.length > 0 ? (
            proposals.map((proposal, index) => <li key={index}>{proposal.description}</li>)
          ) : (
            <p>Aucune proposition enregistrée.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

// Style commun pour chaque carte
const cardStyle = {
  borderRadius: '8px',  // Bordure arrondie
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',  // Ombre autour des éléments
  padding: '1rem',  // Padding pour espacer le contenu
  backgroundColor: '#fff',  // Fond blanc pour chaque carte
  transition: 'transform 0.3s ease',  // Transition douce pour les effets au survol
};
