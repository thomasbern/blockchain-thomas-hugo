import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvent, expectRevert } from '@openzeppelin/test-helpers';
import { Voting } from "../typechain-types";

describe("Voting Contract", function () {
  let voting: Voting;
  let owner: any, voter1: any, voter2: any;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    const VotingFactory = await ethers.getContractFactory("Voting");
    voting = await VotingFactory.deploy();
  });

  /**
   * @notice Vérifie que l'adresse de l'admin est bien celle du propriétaire du contrat
   */
  it("Should set the correct admin", async function () {
    expect(await voting.admin()).to.equal(owner.address);
  });

  /**
   * @notice Enregistre un votant et vérifie que les événements et données sont corrects
   */
  it("Should register a voter", async function () {
    const tx = await voting.registerVoter(voter1.address);
    const receipt = await tx.wait();
    expectEvent(receipt, "VoterRegistered", { voterAddress: voter1.address });

    const voter = await voting.voters(voter1.address);
    expect(voter.isRegistered).to.be.true;
    expect(voter.hasVoted).to.be.false;
  });

  /**
   * @notice Doit rejeter l'enregistrement d'un votant déjà enregistré
   */
  it("Should revert if the voter is already registered", async function () {
    await voting.registerVoter(voter1.address);
    await expectRevert(
      voting.registerVoter(voter1.address),
      "Le votant est deja enregistre !"
    );
  });

  /**
   * @notice Empêche les utilisateurs non enregistrés de proposer des idées
   */
  it("Should not allow unregistered voters to submit proposals", async function () {
    await voting.startProposalRegistration();
    await expectRevert(
      voting.connect(voter1).submitProposal("New Proposal"),
      "Vous n'etes pas un votant enregistre !"
    );
  });

  /**
   * @notice Permet à un votant enregistré de soumettre une proposition
   */
  it("Should allow a registered voter to submit a proposal", async function () {
    await voting.registerVoter(voter1.address);
    await voting.startProposalRegistration();
    const tx = await voting.connect(voter1).submitProposal("Proposal 1");
    const receipt = await tx.wait();
    expectEvent(receipt, "ProposalRegistered", { proposalId: 0 });

    const proposal = await voting.proposals(0);
    expect(proposal.description).to.equal("Proposal 1");
  });

  /**
   * @notice Empêche la soumission de proposition hors période d'enregistrement
   */
  it("Should revert if proposals registration is not started", async function () {
    await expectRevert(
      voting.connect(voter1).submitProposal("Proposal 1"),
      "Les propositions ne sont pas encore ouvertes !"
    );
  });

  /**
   * @notice Démarre la période d'enregistrement des propositions
   */
  it("Should start proposal registration", async function () {
    const tx = await voting.startProposalRegistration();
    const receipt = await tx.wait();
    expectEvent(receipt, "WorkflowStatusChange", {
      previousStatus: 0,
      newStatus: 1,
    });

    const status = await voting.status();
    expect(status).to.equal(1);
  });

  /**
   * @notice Empêche de démarrer l'enregistrement des propositions en dehors de la bonne phase
   */
  it("Should revert if trying to start proposal registration when not in RegisteringVoters", async function () {
    await voting.startProposalRegistration();
    await expectRevert(
      voting.startProposalRegistration(),
      "L'etape actuelle ne permet pas de demarrer l'enregistrement des propositions !"
    );
  });

  /**
   * @notice Termine la période d'enregistrement des propositions
   */
  it("Should end proposal registration", async function () {
    await voting.startProposalRegistration();
    const tx = await voting.endProposalRegistration();
    const receipt = await tx.wait();
    expectEvent(receipt, "WorkflowStatusChange", {
      previousStatus: 1,
      newStatus: 2,
    });

    const status = await voting.status();
    expect(status).to.equal(2);
  });

  /**
   * @notice Empêche de terminer l'enregistrement des propositions hors de la phase correspondante
   */
  it("Should revert if trying to end proposal registration when not in ProposalsRegistrationStarted", async function () {
    await expectRevert(
      voting.endProposalRegistration(),
      "Les propositions doivent etre ouvertes pour les fermer !"
    );
  });

  /**
   * @notice Démarre la session de vote
   */
  it("Should start voting session", async function () {
    await voting.startProposalRegistration();
    await voting.endProposalRegistration();
    const tx = await voting.startVotingSession();
    const receipt = await tx.wait();
    expectEvent(receipt, "WorkflowStatusChange", {
      previousStatus: 2,
      newStatus: 3,
    });

    const status = await voting.status();
    expect(status).to.equal(3);
  });

  /**
   * @notice Empêche de démarrer une session de vote si les propositions ne sont pas encore clôturées
   */
  it("Should revert if trying to start voting session before proposal registration ends", async function () {
    await expectRevert(
      voting.startVotingSession(),
      "Les propositions doivent etre fermees avant de voter !"
    );
  });

  /**
   * @notice Permet à un votant d'effectuer un vote
   */
  it("Should allow a voter to vote", async function () {
    await voting.registerVoter(voter1.address);
    await voting.startProposalRegistration();
    await voting.connect(voter1).submitProposal("Proposal 1");
    await voting.endProposalRegistration();
    await voting.startVotingSession();

    const tx = await voting.connect(voter1).vote(0);
    const receipt = await tx.wait();
    expectEvent(receipt, "Voted", { voter: voter1.address, proposalId: 0 });

    const voter = await voting.voters(voter1.address);
    expect(voter.hasVoted).to.be.true;
  });

  /**
   * @notice Empêche un votant de voter deux fois
   */
  it("Should revert if a voter tries to vote twice", async function () {
    await voting.registerVoter(voter1.address);
    await voting.startProposalRegistration();
    await voting.connect(voter1).submitProposal("Proposal 1");
    await voting.endProposalRegistration();
    await voting.startVotingSession();

    await voting.connect(voter1).vote(0);
    await expectRevert(
      voting.connect(voter1).vote(0),
      "Vous avez deja vote !"
    );
  });

  /**
   * @notice Termine la session de vote
   */
  it("Should end voting session", async function () {
    await voting.startProposalRegistration();
    await voting.endProposalRegistration();
    await voting.startVotingSession();
    const tx = await voting.endVotingSession();
    const receipt = await tx.wait();
    expectEvent(receipt, "WorkflowStatusChange", {
      previousStatus: 3,
      newStatus: 4,
    });

    const status = await voting.status();
    expect(status).to.equal(4);
  });

  /**
   * @notice Calcule correctement le gagnant après les votes
   */
  it("Should tally votes correctly", async function () {
    await voting.registerVoter(voter1.address);
    await voting.registerVoter(voter2.address);
    await voting.startProposalRegistration();
    await voting.connect(voter1).submitProposal("Proposal 1");
    await voting.endProposalRegistration();
    await voting.startVotingSession();
    await voting.connect(voter1).vote(0);
    await voting.connect(voter2).vote(0);
    await voting.endVotingSession();

    const tx = await voting.tallyVotes();
    const receipt = await tx.wait();
    expectEvent(receipt, "WorkflowStatusChange", {
      previousStatus: 4,
      newStatus: 5,
    });

    const winner = await voting.getWinner();
    expect(winner).to.equal(0);
  });

  /**
   * @notice Réinitialise complètement l'état du vote
   */
  it("Should reset voting", async function () {
    await voting.registerVoter(voter1.address);
    await voting.registerVoter(voter2.address);
    await voting.startProposalRegistration();
    await voting.connect(voter1).submitProposal("Proposal 1");
    await voting.endProposalRegistration();
    await voting.startVotingSession();
    await voting.connect(voter1).vote(0);
    await voting.connect(voter2).vote(0);
    await voting.endVotingSession();
    await voting.tallyVotes();

    const tx = await voting.resetVoting();
    const receipt = await tx.wait();
    expectEvent(receipt, "WorkflowStatusChange", {
      previousStatus: 5,
      newStatus: 0,
    });

    const status = await voting.status();
    expect(status).to.equal(0);

    const voter1Data = await voting.voters(voter1.address);
    const voter2Data = await voting.voters(voter2.address);
    expect(voter1Data.hasVoted).to.be.false;
    expect(voter2Data.hasVoted).to.be.false;

    const proposalsArray = voting.proposals;
    expect(proposalsArray.length).to.equal(0);
  });

  /**
   * @notice Retourne correctement le nombre total de votes
   */
  it("Should return total votes", async function () {
    await voting.registerVoter(voter1.address);
    await voting.registerVoter(voter2.address);
    await voting.startProposalRegistration();
    await voting.connect(voter1).submitProposal("Proposal 1");
    await voting.endProposalRegistration();
    await voting.startVotingSession();
    await voting.connect(voter1).vote(0);
    await voting.connect(voter2).vote(0);

    const totalVotes = await voting.getTotalVotes();
    expect(totalVotes).to.equal(2);
  });

  /**
   * @notice Vérifie que l'admin est bien celui du déploiement
   */
  it("Should return the correct admin", async function () {
    const admin = voting.admin;
    expect(admin).to.equal(owner.address);
  });

  /**
   * @notice Empêche de compter les votes si la session de vote n'est pas encore terminée
   */
  it("Should revert if trying to tally votes before voting session ends", async function () {
    await expectRevert(
      voting.tallyVotes(),
      "Le vote doit etre termine avant de compter les votes !"
    );
  });
});
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvent, expectRevert } from '@openzeppelin/test-helpers';
import { Voting } from "../typechain-types";

describe("Voting Contract", function () {
  let voting: Voting;
  let owner: any, voter1: any, voter2: any;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    const VotingFactory = await ethers.getContractFactory("Voting");
    voting = await VotingFactory.deploy();
  });

  /**
   * @notice Vérifie que l'adresse de l'admin est bien celle du propriétaire du contrat
   */
  it("Should set the correct admin", async function () {
    expect(await voting.admin()).to.equal(owner.address);
  });

  /**
   * @notice Enregistre un votant et vérifie que les événements et données sont corrects
   */
  it("Should register a voter", async function () {
    const tx = await voting.registerVoter(voter1.address);
    const receipt = await tx.wait();
    expectEvent(receipt, "VoterRegistered", { voterAddress: voter1.address });

    const voter = await voting.voters(voter1.address);
    expect(voter.isRegistered).to.be.true;
    expect(voter.hasVoted).to.be.false;
  });

  /**
   * @notice Doit rejeter l'enregistrement d'un votant déjà enregistré
   */
  it("Should revert if the voter is already registered", async function () {
    await voting.registerVoter(voter1.address);
    await expectRevert(
      voting.registerVoter(voter1.address),
      "Le votant est deja enregistre !"
    );
  });

  /**
   * @notice Empêche les utilisateurs non enregistrés de proposer des idées
   */
  it("Should not allow unregistered voters to submit proposals", async function () {
    await voting.startProposalRegistration();
    await expectRevert(
      voting.connect(voter1).submitProposal("New Proposal"),
      "Vous n'etes pas un votant enregistre !"
    );
  });

  /**
   * @notice Permet à un votant enregistré de soumettre une proposition
   */
  it("Should allow a registered voter to submit a proposal", async function () {
    await voting.registerVoter(voter1.address);
    await voting.startProposalRegistration();
    const tx = await voting.connect(voter1).submitProposal("Proposal 1");
    const receipt = await tx.wait();
    expectEvent(receipt, "ProposalRegistered", { proposalId: 0 });

    const proposal = await voting.proposals(0);
    expect(proposal.description).to.equal("Proposal 1");
  });

  /**
   * @notice Empêche la soumission de proposition hors période d'enregistrement
   */
  it("Should revert if proposals registration is not started", async function () {
    await expectRevert(
      voting.connect(voter1).submitProposal("Proposal 1"),
      "Les propositions ne sont pas encore ouvertes !"
    );
  });

  /**
   * @notice Démarre la période d'enregistrement des propositions
   */
  it("Should start proposal registration", async function () {
    const tx = await voting.startProposalRegistration();
    const receipt = await tx.wait();
    expectEvent(receipt, "WorkflowStatusChange", {
      previousStatus: 0,
      newStatus: 1,
    });

    const status = await voting.status();
    expect(status).to.equal(1);
  });

  /**
   * @notice Empêche de démarrer l'enregistrement des propositions en dehors de la bonne phase
   */
  it("Should revert if trying to start proposal registration when not in RegisteringVoters", async function () {
    await voting.startProposalRegistration();
    await expectRevert(
      voting.startProposalRegistration(),
      "L'etape actuelle ne permet pas de demarrer l'enregistrement des propositions !"
    );
  });

  /**
   * @notice Termine la période d'enregistrement des propositions
   */
  it("Should end proposal registration", async function () {
    await voting.startProposalRegistration();
    const tx = await voting.endProposalRegistration();
    const receipt = await tx.wait();
    expectEvent(receipt, "WorkflowStatusChange", {
      previousStatus: 1,
      newStatus: 2,
    });

    const status = await voting.status();
    expect(status).to.equal(2);
  });

  /**
   * @notice Empêche de terminer l'enregistrement des propositions hors de la phase correspondante
   */
  it("Should revert if trying to end proposal registration when not in ProposalsRegistrationStarted", async function () {
    await expectRevert(
      voting.endProposalRegistration(),
      "Les propositions doivent etre ouvertes pour les fermer !"
    );
  });

  /**
   * @notice Démarre la session de vote
   */
  it("Should start voting session", async function () {
    await voting.startProposalRegistration();
    await voting.endProposalRegistration();
    const tx = await voting.startVotingSession();
    const receipt = await tx.wait();
    expectEvent(receipt, "WorkflowStatusChange", {
      previousStatus: 2,
      newStatus: 3,
    });

    const status = await voting.status();
    expect(status).to.equal(3);
  });

  /**
   * @notice Empêche de démarrer une session de vote si les propositions ne sont pas encore clôturées
   */
  it("Should revert if trying to start voting session before proposal registration ends", async function () {
    await expectRevert(
      voting.startVotingSession(),
      "Les propositions doivent etre fermees avant de voter !"
    );
  });

  /**
   * @notice Permet à un votant d'effectuer un vote
   */
  it("Should allow a voter to vote", async function () {
    await voting.registerVoter(voter1.address);
    await voting.startProposalRegistration();
    await voting.connect(voter1).submitProposal("Proposal 1");
    await voting.endProposalRegistration();
    await voting.startVotingSession();

    const tx = await voting.connect(voter1).vote(0);
    const receipt = await tx.wait();
    expectEvent(receipt, "Voted", { voter: voter1.address, proposalId: 0 });

    const voter = await voting.voters(voter1.address);
    expect(voter.hasVoted).to.be.true;
  });

  /**
   * @notice Empêche un votant de voter deux fois
   */
  it("Should revert if a voter tries to vote twice", async function () {
    await voting.registerVoter(voter1.address);
    await voting.startProposalRegistration();
    await voting.connect(voter1).submitProposal("Proposal 1");
    await voting.endProposalRegistration();
    await voting.startVotingSession();

    await voting.connect(voter1).vote(0);
    await expectRevert(
      voting.connect(voter1).vote(0),
      "Vous avez deja vote !"
    );
  });

  /**
   * @notice Termine la session de vote
   */
  it("Should end voting session", async function () {
    await voting.startProposalRegistration();
    await voting.endProposalRegistration();
    await voting.startVotingSession();
    const tx = await voting.endVotingSession();
    const receipt = await tx.wait();
    expectEvent(receipt, "WorkflowStatusChange", {
      previousStatus: 3,
      newStatus: 4,
    });

    const status = await voting.status();
    expect(status).to.equal(4);
  });

  /**
   * @notice Calcule correctement le gagnant après les votes
   */
  it("Should tally votes correctly", async function () {
    await voting.registerVoter(voter1.address);
    await voting.registerVoter(voter2.address);
    await voting.startProposalRegistration();
    await voting.connect(voter1).submitProposal("Proposal 1");
    await voting.endProposalRegistration();
    await voting.startVotingSession();
    await voting.connect(voter1).vote(0);
    await voting.connect(voter2).vote(0);
    await voting.endVotingSession();

    const tx = await voting.tallyVotes();
    const receipt = await tx.wait();
    expectEvent(receipt, "WorkflowStatusChange", {
      previousStatus: 4,
      newStatus: 5,
    });

    const winner = await voting.getWinner();
    expect(winner).to.equal(0);
  });

  /**
   * @notice Réinitialise complètement l'état du vote
   */
  it("Should reset voting", async function () {
    await voting.registerVoter(voter1.address);
    await voting.registerVoter(voter2.address);
    await voting.startProposalRegistration();
    await voting.connect(voter1).submitProposal("Proposal 1");
    await voting.endProposalRegistration();
    await voting.startVotingSession();
    await voting.connect(voter1).vote(0);
    await voting.connect(voter2).vote(0);
    await voting.endVotingSession();
    await voting.tallyVotes();

    const tx = await voting.resetVoting();
    const receipt = await tx.wait();
    expectEvent(receipt, "WorkflowStatusChange", {
      previousStatus: 5,
      newStatus: 0,
    });

    const status = await voting.status();
    expect(status).to.equal(0);

    const voter1Data = await voting.voters(voter1.address);
    const voter2Data = await voting.voters(voter2.address);
    expect(voter1Data.hasVoted).to.be.false;
    expect(voter2Data.hasVoted).to.be.false;

    const proposalsArray = voting.proposals;
    expect(proposalsArray.length).to.equal(0);
  });

  /**
   * @notice Retourne correctement le nombre total de votes
   */
  it("Should return total votes", async function () {
    await voting.registerVoter(voter1.address);
    await voting.registerVoter(voter2.address);
    await voting.startProposalRegistration();
    await voting.connect(voter1).submitProposal("Proposal 1");
    await voting.endProposalRegistration();
    await voting.startVotingSession();
    await voting.connect(voter1).vote(0);
    await voting.connect(voter2).vote(0);

    const totalVotes = await voting.getTotalVotes();
    expect(totalVotes).to.equal(2);
  });

  /**
   * @notice Vérifie que l'admin est bien celui du déploiement
   */
  it("Should return the correct admin", async function () {
    const admin = voting.admin;
    expect(admin).to.equal(owner.address);
  });

  /**
   * @notice Empêche de compter les votes si la session de vote n'est pas encore terminée
   */
  it("Should revert if trying to tally votes before voting session ends", async function () {
    await expectRevert(
      voting.tallyVotes(),
      "Le vote doit etre termine avant de compter les votes !"
    );
  });
});
