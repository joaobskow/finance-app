import { initializeApp } from "firebase/app";
import { browserPopupRedirectResolver, initializeAuth, inMemoryPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
// A sessão existe somente enquanto esta instância do app estiver aberta.
// Assim, ao fechar o PWA o usuário precisa entrar novamente.
export const auth = initializeAuth(app, {
  persistence: inMemoryPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});
export const db = getFirestore(app);
