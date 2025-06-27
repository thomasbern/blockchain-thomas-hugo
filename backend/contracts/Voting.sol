// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Système de vote basé sur la blockchain
/// @author 
/// @notice Ce contrat permet à un administrateur d'organiser un vote avec des propositions et des électeurs enregistrés.
/// @dev Utilise OpenZeppelin Ownable pour la gestion des droits
contract Voting is Ownable {

    /// @notice Adresse de l'administrateur
    address public admin;

    /// @notice Liste des adresses des votants enregistrés
    address[] public voterAddresses;

    /// @notice Mapping des adresses vers les informations des votants
    mapping(address => Voter) public voters;

    /// @notice Liste des propositions soumises
    Proposal[] public proposals;

    /// @notice ID de la proposition gagnante après décompte des votes
    uint public winningProposalId;

    /// @notice État actuel du workflow du vote
    WorkflowStatus public status;

    /// @notice Initialise le contrat et définit l'administrateur
    constructor() Ownable(msg.sender) {
        admin = msg.sender;
        status = WorkflowStatus.RegisteringVoters;
    }

    /// @notice États possibles du workflow
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /// @notice Informations liées à un votant
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    /// @notice Structure d'une proposition
    struct Proposal {
        string description;
        uint voteCount;
    }

    /// @notice Événement déclenché lorsqu'un votant est enregistré
    event VoterRegistered(address voterAddress);

    /// @notice Événement déclenché lorsqu'on change d'étape du workflow
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    /// @notice Événement déclenché lorsqu'une proposition est enregistrée
    event ProposalRegistered(uint proposalId);

    /// @notice Événement déclenché lorsqu'un vote est effectué
    event Voted(address voter, uint proposalId);

    /// @notice Événement déclenché lors de la déclaration du gagnant
    event WinnerDeclared(uint winningProposalId, uint voteCount);

    /// @dev Vérifie si l'appelant est l'admin
    modifier onlyAdmin {
        require(msg.sender == admin, "Seul l'admin peut faire cette action ^^");
        _;
    }

    /// @notice Vérifie si une adresse est l'admin
    /// @param user L'adresse à vérifier
    /// @return bool Vrai si admin, sinon faux
    function checkIfAdmin(address user) public view returns (bool) {
        return user == admin;
    }

    /// @notice Vérifie si un utilisateur est enregistré comme votant
    /// @param user L'adresse à vérifier
    /// @return bool Vrai si enregistré, sinon faux
    function isRegisteredVoter(address user) public view returns (bool) {
        return voters[user].isRegistered;
    }

    /// @notice Retourne toutes les adresses des votants enregistrés
    /// @return Liste d'adresses des votants
    function getVoterAddresses() public view returns (address[] memory) {
        return voterAddresses;
    }

    /// @notice Retourne toutes les propositions enregistrées
    /// @return Tableau de propositions
    function getProposals() public view returns (Proposal[] memory) {
        return proposals;
    }

    /// @notice Enregistre un votant pendant la phase d'enregistrement
    /// @param _voter Adresse du votant à enregistrer
    function registerVoter(address _voter) public onlyAdmin {
        require(status == WorkflowStatus.RegisteringVoters, "L'enregistrement des votants est termine !");
        require(!voters[_voter].isRegistered, "Le votant est deja enregistre !");
        voters[_voter] = Voter(true, false, 0);
        voterAddresses.push(_voter);
        emit VoterRegistered(_voter);
    }

    /// @notice Démarre la phase d'enregistrement des propositions
    function startProposalRegistration() public onlyAdmin {
        require(status == WorkflowStatus.RegisteringVoters, "L'etape actuelle ne permet pas de demarrer l'enregistrement des propositions !");
        status = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, status);
    }

    /// @notice Permet à un votant enregistré de soumettre une proposition
    /// @param _description La description de la proposition
    function submitProposal(string memory _description) public {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Les propositions ne sont pas encore ouvertes !");
        require(voters[msg.sender].isRegistered, "Vous n'etes pas un votant enregistre !");
        require(bytes(_description).length > 0, "La description ne peut pas etre vide !");
        proposals.push(Proposal(_description, 0));
        emit ProposalRegistered(proposals.length - 1);
    }

    /// @notice Termine la phase d'enregistrement des propositions
    function endProposalRegistration() public onlyAdmin {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Les propositions doivent etre ouvertes pour les fermer !");
        status = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, status);
    }

    /// @notice Démarre la session de vote
    function startVotingSession() public onlyAdmin {
        require(status == WorkflowStatus.ProposalsRegistrationEnded, "Les propositions doivent etre fermees avant de voter !");
        status = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, status);
    }

    /// @notice Permet à un votant de voter pour une proposition
    /// @param _proposalId ID de la proposition à voter
    function vote(uint _proposalId) public {
        require(status == WorkflowStatus.VotingSessionStarted, "Le vote n'est pas encore ouvert !");
        require(voters[msg.sender].isRegistered, "Vous n'etes pas un votant enregistre !");
        require(!voters[msg.sender].hasVoted, "Vous avez deja vote !");
        require(_proposalId < proposals.length, "ID de proposition invalide !");
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;
        emit Voted(msg.sender, _proposalId);
    }

    /// @notice Termine la session de vote
    function endVotingSession() public onlyAdmin {
        require(status == WorkflowStatus.VotingSessionStarted, "Le vote doit etre en cours pour etre ferme !");
        status = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, status);
    }

    /// @notice Compte les votes et déclare le gagnant
    function tallyVotes() public onlyAdmin {
        require(status == WorkflowStatus.VotingSessionEnded, "Le vote doit etre termine avant de compter les votes !");
        uint maxVotes = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVotes) {
                maxVotes = proposals[i].voteCount;
                winningProposalId = i;
            }
        }
        status = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, status);
        emit WinnerDeclared(winningProposalId, maxVotes);
    }

    /// @notice Retourne l'ID de la proposition gagnante
    /// @return uint ID de la proposition gagnante
    function getWinner() public view returns (uint) {
        require(status == WorkflowStatus.VotesTallied, "Les votes doivent etre comptes avant d'afficher le gagnant !");
        return winningProposalId;
    }

    /// @notice Réinitialise le vote pour une nouvelle session
    function resetVoting() public onlyAdmin {
        require(status == WorkflowStatus.VotesTallied, "Le vote doit etre termine pour etre reinitialise !");
        for (uint i = 0; i < voterAddresses.length; i++) {
            voters[voterAddresses[i]].hasVoted = false;
            voters[voterAddresses[i]].votedProposalId = 0;
        }
        while (proposals.length > 0) {
            proposals.pop();
        }
        status = WorkflowStatus.RegisteringVoters;
        emit WorkflowStatusChange(WorkflowStatus.VotesTallied, status);
    }

    /// @notice Retourne le nombre total de votes comptabilisés
    /// @return uint Nombre total de votes
    function getTotalVotes() public view returns (uint) {
        uint totalVotes = 0;
        for (uint i = 0; i < proposals.length; i++) {
            totalVotes += proposals[i].voteCount;
        }
        return totalVotes;
    }
}
