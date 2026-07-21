import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  linkWithCredential,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { auth, db } from "../firebase/configuracao.js";
import { COLECOES, DEFAULT_GOALS } from "../services/servicoFirestore.js";

const ContextoAutenticacao = createContext(null);

/** Cria o documento do usuário e as metas padrão no Firestore, se ainda não existirem */
const META_PARA_BANCO = { food: "alimentacao", transport: "transporte", leisure: "lazer", other: "outros" };
const CATEGORIA_PARA_BANCO = { food: "alimentacao", transport: "transporte", leisure: "lazer", other: "outros", income: "receita" };

async function migrateLegacyUser(uid) {
  const antigoRef = doc(db, "users", uid);
  const antigo = await getDoc(antigoRef);
  if (!antigo.exists()) return false;

  const [metasAntigas, transacoesAntigas] = await Promise.all([
    getDocs(collection(db, "users", uid, "goals")),
    getDocs(collection(db, "users", uid, "transactions")),
  ]);
  const dados = antigo.data();
  const lote = writeBatch(db);
  lote.set(doc(db, COLECOES.usuarios, uid), {
    nome: dados.name || "Usuário",
    email: dados.email || "",
    saldo: dados.balance || 0,
    ...(dados.photoUrl ? { fotoPerfil: dados.photoUrl } : {}),
    ...(dados.notificationsEnabled !== undefined ? { notificacoesAtivadas: dados.notificationsEnabled } : {}),
    ...(dados.lastWeeklyReminder ? { ultimoLembreteSemanal: dados.lastWeeklyReminder } : {}),
    criadoEm: dados.createdAt || serverTimestamp(),
  });
  metasAntigas.forEach((item) => {
    const meta = item.data();
    const novoId = META_PARA_BANCO[item.id] || item.id;
    lote.set(doc(db, COLECOES.usuarios, uid, COLECOES.metas, novoId), { rotulo: meta.label || "Meta", gasto: meta.spent || 0, limite: meta.total || 0, cor: meta.color || "#636e72" });
    lote.delete(item.ref);
  });
  transacoesAntigas.forEach((item) => {
    const transacao = item.data();
    lote.set(doc(db, COLECOES.usuarios, uid, COLECOES.transacoes, item.id), {
      descricao: transacao.title || transacao.descricao || "Lançamento sem descrição",
      categoria: CATEGORIA_PARA_BANCO[transacao.category] || transacao.categoria || "outros",
      ...(transacao.customCategory ? { categoriaPersonalizada: transacao.customCategory } : {}),
      valor: typeof transacao.amount === "number" ? transacao.amount : (typeof transacao.valor === "number" ? transacao.valor : 0),
      criadoEm: transacao.createdAt || transacao.criadoEm || new Date().toISOString(),
    });
    lote.delete(item.ref);
  });
  lote.delete(antigoRef);
  await lote.commit();
  return true;
}

async function ensureUserDocument(uid, { name, email, photoUrl }) {
  const userRef = doc(db, COLECOES.usuarios, uid);
  const existing = await getDoc(userRef);
  if (existing.exists()) {
    if (!existing.data().fotoPerfil && photoUrl) {
      await setDoc(userRef, { fotoPerfil: photoUrl }, { merge: true });
    }
    return;
  }

  if (await migrateLegacyUser(uid)) {
    const migrated = await getDoc(userRef);
    if (!migrated.data()?.fotoPerfil && photoUrl) await setDoc(userRef, { fotoPerfil: photoUrl }, { merge: true });
    return;
  }

  await setDoc(userRef, {
    nome: name,
    email,
    saldo: 0,
    ...(photoUrl ? { fotoPerfil: photoUrl } : {}),
    criadoEm: serverTimestamp(),
  });

  await Promise.all(
    DEFAULT_GOALS.map((goal) => setDoc(doc(db, COLECOES.usuarios, uid, COLECOES.metas, META_PARA_BANCO[goal.id]), { rotulo: goal.label, gasto: goal.spent, limite: goal.total, cor: goal.color }))
  );
}

export function ProvedorAutenticacao({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await ensureUserDocument(firebaseUser.uid, {
            name: firebaseUser.displayName || "Usuário",
            email: firebaseUser.email,
            photoUrl: firebaseUser.photoURL || "",
          });
        } catch {
          // A sessão continua disponível; a interface lidará com eventual falha de rede.
        }
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signup(name, email, password) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    await ensureUserDocument(credential.user.uid, { name, email });
    return credential.user;
  }

  async function login(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDocument(credential.user.uid, { name: credential.user.displayName || "Usuário", email: credential.user.email });
    return credential.user;
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    await ensureUserDocument(credential.user.uid, {
      name: credential.user.displayName || "Usuário Google",
      email: credential.user.email,
      photoUrl: credential.user.photoURL || "",
    });
    return credential.user;
  }

  async function logout() {
    await signOut(auth);
  }

  async function changePassword(currentPassword, newPassword) {
    if (!auth.currentUser?.email) throw new Error("Esta conta não usa senha por e-mail.");
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  }

  async function createPasswordForGoogleAccount(newPassword) {
    if (!auth.currentUser?.email) throw new Error("Não foi possível identificar o e-mail desta conta.");
    const credential = EmailAuthProvider.credential(auth.currentUser.email, newPassword);
    await linkWithCredential(auth.currentUser, credential);
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  const value = { user, loading, signup, login, loginWithGoogle, logout, changePassword, createPasswordForGoogleAccount, resetPassword };

  return <ContextoAutenticacao.Provider value={value}>{children}</ContextoAutenticacao.Provider>;
}

export function usarAutenticacao() {
  const ctx = useContext(ContextoAutenticacao);
  if (!ctx) throw new Error("usarAutenticacao precisa estar dentro de um ProvedorAutenticacao");
  return ctx;
}
