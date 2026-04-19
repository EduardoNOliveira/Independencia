// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, get, child, onValue, off } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-Yd7vqqVw7s5W21clNG3DdopcySFXJxQ",
  authDomain: "lotofacil2026-63cec.firebaseapp.com",
  projectId: "lotofacil2026-63cec",
  storageBucket: "lotofacil2026-63cec.firebasestorage.app",
  messagingSenderId: "67841661053",
  appId: "1:67841661053:web:f848eec4e264a4d9d7f914",
  databaseURL: "https://lotofacil2026-63cec-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getDatabase(app);

// Mapeamento simples de usuario para email de login no Firebase Auth.
// Ajuste conforme os usuarios cadastrados no Console do Firebase.
const USERNAME_TO_EMAIL = {
  Eduardo: "eduardo.noliveira.login@gmail.com"
};

// Inicializacao de estado de autenticacao
let authInitialized = false;
let authReadyPromise = null;

// Variável global para controlar se estamos salvando (evitar loops)
let isSaving = false;
let realtimeListener = null;

export function initializeAuth() {
  if (authInitialized) return Promise.resolve();
  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.warn("Aviso ao configurar persistencia de sessao:", error);
      }

      authInitialized = true;
      unsubscribe();
      resolve();
    });
  });

  return authReadyPromise;
}

function resolveUserToEmail(userInput) {
  const valor = (userInput || "").trim();

  if (!valor) return "";
  if (valor.includes("@")) return valor.toLowerCase();

  return USERNAME_TO_EMAIL[valor] || "";
}

export async function loginWithUsernameAndPassword(userInput, password) {
  await initializeAuth();

  const email = resolveUserToEmail(userInput);
  if (!email) {
    throw new Error("Usuario nao configurado para login.");
  }

  if (!password) {
    throw new Error("Senha obrigatoria.");
  }

  return signInWithEmailAndPassword(auth, email, password);
}

// Helper function to save data to Firebase (atualizada)
export async function saveToFirebase(path, data) {
  try {
    isSaving = true;
    const dbRef = ref(db, path);
    await set(dbRef, data);
    
    // Pequeno delay para garantir que o listener não seja acionado
    setTimeout(() => {
      isSaving = false;
    }, 100);
    
    return true;
  } catch (error) {
    isSaving = false;
    console.error("Erro ao salvar no Firebase:", error);
    return false;
  }
}

// Helper function to get data from Firebase
export async function getFromFirebase(path) {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, path));
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar do Firebase:", error);
    return null;
  }
}

// Helper function to remove data from Firebase
export async function removeFromFirebase(path) {
  try {
    const dbRef = ref(db, path);
    await set(dbRef, null);
    return true;
  } catch (error) {
    console.error("Erro ao remover do Firebase:", error);
    return false;
  }
}

// Listener para sincronização em tempo real
export function setupRealtimeSync(onDataChange) {
  // Remover listener anterior se existir
  if (realtimeListener) {
    off(realtimeListener);
  }
  
  const dbRef = ref(db, "dados/lotofacil2026");
  
  realtimeListener = onValue(dbRef, (snapshot) => {
    // Ignorar se estamos salvando (evitar loop)
    if (isSaving) {
      return;
    }
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Verificar se os dados são válidos
      if (!Array.isArray(data)) {
        console.warn("⚠️ Dados do Firebase não são um array válido");
        return;
      }
      
      const localData = localStorage.getItem("lotofacil2026");
      const localDataParsed = localData ? JSON.parse(localData) : null;
      
      // Só atualizar se os dados forem diferentes
      if (JSON.stringify(localDataParsed) !== JSON.stringify(data)) {
        localStorage.setItem("lotofacil2026", JSON.stringify(data));
        console.log("🔄 Dados sincronizados em tempo real do Firebase");
        
        // Notificar a aplicação que os dados mudaram
        if (onDataChange) {
          onDataChange(data);
        }
        
        // Disparar evento customizado
        window.dispatchEvent(new CustomEvent("dataUpdated", { detail: data }));
      }
    } else {
      console.log("⚠️ Nenhum dado encontrado no Firebase");
    }
  }, (error) => {
    console.error("❌ Erro ao monitorar dados do Firebase:", error);
  });
  
  return realtimeListener;
}

// Função para limpar listener
export function cleanupRealtimeSync() {
  if (realtimeListener) {
    off(realtimeListener);
    realtimeListener = null;
  }
}

// Função para fazer logout do Firebase Auth
export async function logoutFirebaseAuth() {
  try {
    await signOut(auth);
    console.log("✅ Logout do Firebase Auth realizado");
    return true;
  } catch (error) {
    console.error("❌ Erro ao fazer logout do Firebase Auth:", error);
    return false;
  }
}
// {
//   "rules": {
//     "dados": {
//       "$key": {
//         ".read": true,
//         ".write": true
//       }
//     },
//     "users": {
//       "$uid": {
//         ".read": "$uid === auth.uid",
//         ".write": "$uid === auth.uid"
//       }
//     }
//   }
// }
