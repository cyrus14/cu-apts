import firebase from 'firebase';
import { config } from 'dotenv';
import { AxiosRequestConfig } from 'axios';

config();

const firebaseConfig = {
  apiKey: 'AIzaSyCJulo-7tVPqEEsTTRjEsUzSRw8-RCLDVw',
  authDomain: 'cuapts-68201.firebaseapp.com',
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const provider = new firebase.auth.GoogleAuthProvider();

const getUser = async () => {
  if (!auth.currentUser) {
    await auth.signInWithPopup(provider);
  }
  const user = auth.currentUser;
  if (user?.email?.endsWith('@cornell.edu')) {
    return user;
  }
  await auth.signOut();
  return null;
};

const createAuthHeaders = (token: string): AxiosRequestConfig => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export { createAuthHeaders, getUser };
