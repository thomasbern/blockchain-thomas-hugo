import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';
import { contractAddress, abi } from '@/constants';

export const isContractRunner = async (userAddress) => {
  try {
    const isAdmin = await readContract({
      address: contractAddress,
      abi,
      functionName: 'checkIfAdmin',
      args: [userAddress],
    });

    return isAdmin;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut d\'administrateur :', error);
    throw new Error('Une erreur est survenue lors de la vérification du statut d\'administrateur');
  }
}

export const isRegistered = async (user) => {
  try {
    const isRegistered = await readContract({
      address: contractAddress,
      abi,
      functionName: 'isRegisteredVoter',
      args: [user],
    });

    return isRegistered;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut d\'administrateur :', error);
    throw new Error('Une erreur est survenue lors de la vérification du statut d\'administrateur');
  }
}
 
export const getVoters = async () => {
  try {
    const votersList = await readContract({
      address: contractAddress,
      abi,
      functionName: 'getVoterAddresses',
    });

    return votersList;
  } catch (error) {
    console.error('Erreur lors de la récupération des votants :', error);
    throw new Error('Une erreur est survenue lors de la récupération des votants');
  }
};

/**
 * Enregistre un votant.
 * @param {string} voterAddress - Adresse du votant à enregistrer.
 */
export const registerVoter = async (voterAddress) => {
  try {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi,
      functionName: 'registerVoter',
      args: [voterAddress],
    });

    const { hash } = await writeContract(request);
    console.log(`Votant enregistré avec succès. Hash de la transaction : ${hash}`);
    return hash;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du votant :', error);
    throw new Error('Une erreur est survenue lors de l\'enregistrement du votant');
  }
};

/**
 * Démarre la session d'enregistrement des propositions.
 */
export const startProposalRegistration = async () => {
  try {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi,
      functionName: 'startProposalRegistration',
    });

    const { hash } = await writeContract(request);
    console.log(`Session d'enregistrement des propositions démarrée. Hash de la transaction : ${hash}`);
    return hash;
  } catch (error) {
    console.error('Erreur lors du démarrage de la session d\'enregistrement des propositions :', error);
    throw new Error('Une erreur est survenue lors du démarrage de la session d\'enregistrement des propositions');
  }
};

/**
 * Soumet une proposition.
 * @param {string} description - Description de la proposition à soumettre.
 */
export const submitProposal = async (description) => {
  try {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi,
      functionName: 'submitProposal',
      args: [description],
    });

    const { hash } = await writeContract(request);
    console.log(`Proposition soumise avec succès. Hash de la transaction : ${hash}`);
    return hash;
  } catch (error) {
    console.error('Erreur lors de la soumission de la proposition :', error);
    throw new Error('Une erreur est survenue lors de la soumission de la proposition');
  }
};

export const endProposalRegistration = async () => {
  try {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi,
      functionName: 'endProposalRegistration',
    });

    const { hash } = await writeContract(request);
    console.log(`Session d'enregistrement des propositions démarrée. Hash de la transaction : ${hash}`);
    return hash;
  } catch (error) {
    console.error('Erreur lors du démarrage de la session d\'enregistrement des propositions :', error);
    throw new Error('Une erreur est survenue lors du démarrage de la session d\'enregistrement des propositions');
  }
};

/**
 * Démarre la session de vote.
 */
export const startVotingSession = async () => {
  try {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi,
      functionName: 'startVotingSession',
    });

    const { hash } = await writeContract(request);
    console.log(`Session de vote démarrée. Hash de la transaction : ${hash}`);
    return hash;
  } catch (error) {
    console.error('Erreur lors du démarrage de la session de vote :', error);
    throw new Error('Une erreur est survenue lors du démarrage de la session de vote');
  }
};

/**
 * Vote pour une proposition.
 * @param {number} proposalId - ID de la proposition à voter.
 */
export const vote = async (proposalId) => {
  try {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi,
      functionName: 'vote',
      args: [proposalId],
    });

    const { hash } = await writeContract(request);
    console.log(`Vote enregistré avec succès. Hash de la transaction : ${hash}`);
    return hash;
  } catch (error) {
    console.error('Erreur lors du vote :', error);
    throw new Error('Une erreur est survenue lors du vote');
  }
};

/**
 * Met fin à la session de vote.
 */
export const endVotingSession = async () => {
  try {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi,
      functionName: 'endVotingSession',
    });

    const { hash } = await writeContract(request);
    console.log(`Session de vote terminée. Hash de la transaction : ${hash}`);
    return hash;
  } catch (error) {
    console.error('Erreur lors de la fin de la session de vote :', error);
    throw new Error('Une erreur est survenue lors de la fin de la session de vote');
  }
};

/**
 * Comptabilise les votes.
 */
export const tallyVotes = async () => {
  try {
    const { request } = await prepareWriteContract({
      address: contractAddress,
      abi,
      functionName: 'tallyVotes',
    });

    const { hash } = await writeContract(request);
    console.log(`Votes comptabilisés avec succès. Hash de la transaction : ${hash}`);
    return hash;
  } catch (error) {
    console.error('Erreur lors de la comptabilisation des votes :', error);
    throw new Error('Une erreur est survenue lors de la comptabilisation des votes');
  }
};

/**
 * Récupère le statut actuel du processus de vote (enregistrement des propositions, session de vote, etc.).
 */
export const getVotingStatus = async () => {
  try {
    const status = await readContract({
      address: contractAddress,
      abi,
      functionName: 'status',
    });
    return status;
  } catch (error) {
    console.error('Erreur lors de la récupération du statut du processus de vote :', error);
    throw new Error('Une erreur est survenue lors de la récupération du statut');
  }
};

/**
 * Récupère le gagnant de l'élection.
 */
export const getWinner = async () => {
  try {
    const winnerId = await readContract({
      address: contractAddress,
      abi,
      functionName: 'getWinner',
    });
    return winnerId;
  } catch (error) {
    console.error('Erreur lors de la récupération du gagnant :', error);
    throw new Error('Une erreur est survenue lors de la récupération du gagnant');
  }
};

/**
 * Récupère toutes les propositions enregistrées et leurs votes.
 */
export const getProposals = async () => {
  try {
    const proposals = await readContract({
      address: contractAddress,
      abi,
      functionName: 'getProposals',
    });

    return proposals;
  } catch (error) {
    console.error('Erreur lors de la récupération des propositions :', error);
    throw new Error('Une erreur est survenue lors de la récupération des propositions');
  }
};
  