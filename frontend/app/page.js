'use client'
import '/styles/global.css';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import AdminDashboard from '@/admin/AdminDashboard';
import VoterDashboard from '@/vote/VoterDashboard';


import Header from '@/shared/Header';
import Footer from '@/shared/Footer';
import GetResults from '@/shared/GetResults';
import Notification from '@/shared/Notification';

import { isContractRunner, isRegistered } from '@/contract/Voting';

export default function Home() {
  const [notification, setNotification] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVoter, setIsVoter] = useState(false); // Nouvel état pour savoir si l'utilisateur est un votant enregistré

  const { address, isConnected } = useAccount();

  // Vérifie si l'utilisateur est un admin
  const checkIfAdmin = async () => {
    if (isConnected && address) {
      try {
        setIsAdmin(await isContractRunner(address));
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    }
  }

  // Vérifie si l'utilisateur est un votant enregistré
  const checkIfVoter = async () => {
    if (isConnected && address) {
      try {
        setIsVoter(await isRegistered(address));  // Appelle la fonction isRegistered pour vérifier l'enregistrement du votant
      } catch (error) {
        console.error('Error checking voter registration status:', error);
        setIsVoter(false);
      }
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      checkIfAdmin();
      checkIfVoter();
    }
  }, [address, isConnected]);

  return (
    <div>
      <Header />
      <ConnectButton onConnect={(address) => {
        checkIfAdmin();
        checkIfVoter();
      }} />

      {/* notification */}
      {notification && <Notification message={notification.message} type={notification.type} />}

      {/* Panel Admin */}
      {isAdmin ? (
        <AdminDashboard setNotification={setNotification} />
      ) : (
        ""
      )}

      {/* Panel Voter */}
      {isVoter ? (
        <VoterDashboard setNotification={setNotification} />
      ) : isConnected ? (
        <div>
          <p>Vous devez être un votant enregistré pour accéder au tableau de bord du votant.</p>
        </div>
      ) : (
        <div>
          <p>Veuillez vous connecter pour vérifier votre statut de votant.</p>
        </div>
      )}

      {/* Panel GetResults */}
      <GetResults />


      <Footer />
    </div>
  );
}
