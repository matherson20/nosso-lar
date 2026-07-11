import { db } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

// ── Itens (moveis/compras por comodo) ───────────────────────────────────────

export function watchItems(cb) {
  const q = query(collection(db, "items"), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}

export function addItem(data, user) {
  return addDoc(collection(db, "items"), {
    ...data,
    criadoPor: { email: user.email, nome: user.displayName || user.email },
    criadoEm: serverTimestamp(),
  });
}

export function updateItem(id, data) {
  return updateDoc(doc(db, "items", id), data);
}

export function deleteItem(id) {
  return deleteDoc(doc(db, "items", id));
}

// ── Gastos fixos (recorrentes) e gastos unicos da mudanca ───────────────────

export function watchFixedExpenses(cb) {
  const q = query(collection(db, "fixedExpenses"), orderBy("criadoEm", "asc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}

export function addFixedExpense(data, user) {
  return addDoc(collection(db, "fixedExpenses"), {
    ...data,
    criadoPor: { email: user.email, nome: user.displayName || user.email },
    criadoEm: serverTimestamp(),
  });
}

export function updateFixedExpense(id, data) {
  return updateDoc(doc(db, "fixedExpenses", id), data);
}

export function deleteFixedExpense(id) {
  return deleteDoc(doc(db, "fixedExpenses", id));
}

// ── Configuracoes compartilhadas (comodos customizados) ─────────────────────

export function watchSettings(cb) {
  return onSnapshot(doc(db, "settings", "config"), (snap) =>
    cb(snap.exists() ? snap.data() : {})
  );
}

export function addComodoCustom(nome) {
  return setDoc(
    doc(db, "settings", "config"),
    { comodosCustom: arrayUnion(nome) },
    { merge: true }
  );
}
