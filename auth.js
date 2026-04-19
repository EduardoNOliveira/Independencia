// Import Firebase functions
import { initializeAuth, saveToFirebase, getFromFirebase, removeFromFirebase, auth } from "./firebase-config.js";

// Initialize Firebase when page loads
async function initializeApp() {
  try {
    await initializeAuth();
    console.log("Firebase inicializado com sucesso");
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
  }
}

// Initialize Firebase on load
initializeApp();

export async function checkAuth() {
  try {
    // Aguardar autenticação anônima se necessário
    await initializeAuth();
    
    // Pequeno delay para garantir que o auth esteja pronto
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Buscar status de autenticação do Firebase
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      console.log("❌ Nenhum usuário autenticado - redirecionando para login");
      window.location.href = "login.html";
      return false;
    }
    
    // Verificar se o usuario fez login (tem dados de auth no Firebase)
    const authStatus = await getFromFirebase(`users/${userId}/auth`);

    if (!authStatus || authStatus.status !== "ok") {
      const fallbackLocal = localStorage.getItem("authLocalFallback") === "ok";

      if (!fallbackLocal) {
        console.log("❌ Usuário não autenticado - redirecionando para login");
        console.log("AuthStatus:", authStatus);
        window.location.href = "login.html";
        return false;
      }

      console.warn("⚠️ Usando fallback local de autenticacao (Realtime Database indisponivel)");
      return true;
    }
    
    console.log("✅ Usuário autenticado:", authStatus.username);
    return true;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    window.location.href = "login.html";
    return false;
  }
}

async function logout() {
  try {
    console.log("🔓 Função logout acionada");
    // Remover dados de autenticação do Firebase
    const userId = auth.currentUser?.uid;
    
    if (userId) {
      console.log("Removendo dados de UID:", userId);
      await removeFromFirebase(`users/${userId}/auth`);
      console.log("✅ Dados removidos do Firebase");
    }

    localStorage.removeItem("authLocalFallback");
    
    // Fazer logout do Firebase Auth
    const { logoutFirebaseAuth } = await import("./firebase-config.js");
    await logoutFirebaseAuth();
    
    console.log("✅ Logout bem-sucedido - redirecionando para login");
    // Redirecionar para página de login
    location.href = "login.html";
  } catch (error) {
    console.error("❌ Erro ao fazer logout:", error);
    localStorage.removeItem("authLocalFallback");
    // Mesmo com erro, redirecionar para login
    location.href = "login.html";
  }
}

// Sincroniza dados da aplicação com Firebase
export async function setupDataSync() {
  try {
    // Usar chave fixa 'shared' para todos os dispositivos acessarem os mesmos dados
    const firebaseData = await getFromFirebase(`dados/lotofacil2026`);
    
    if (firebaseData && Array.isArray(firebaseData)) {
      // Se existem dados no Firebase, usar eles (sempre priorizar Firebase)
      localStorage.setItem("lotofacil2026", JSON.stringify(firebaseData));
      console.log("✅ Dados sincronizados do Firebase");
      return firebaseData;
    } else {
      // Se não existem, enviar dados locais para Firebase
      const localData = localStorage.getItem("lotofacil2026");
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            await saveToFirebase(`dados/lotofacil2026`, parsed);
            console.log("✅ Dados locais sincronizados para Firebase");
            return parsed;
          }
        } catch (e) {
          console.error("Erro ao parsear dados locais:", e);
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Erro ao sincronizar dados:", error);
    throw error;
  }
}

// Função para salvar dados no Firebase (chamada pela aplicação)
export async function salvarDadosFirebase(dados) {
  try {
    if (!dados || !Array.isArray(dados)) {
      console.warn("⚠️ Dados inválidos para salvar no Firebase");
      return false;
    }
    
    // Usar chave fixa para que todos os dispositivos compartilhem
    await saveToFirebase(`dados/lotofacil2026`, dados);
    console.log("✅ Dados salvos no Firebase com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao salvar dados no Firebase:", error);
    return false;
  }
}

// Exportar todas as funções públicas
export { logout };