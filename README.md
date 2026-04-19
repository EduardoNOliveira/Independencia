# Independencia

Aplicacao web para controle de cotas mensais da Lotofacil da Independencia 2026, com sincronizacao em tempo real entre dispositivos usando Firebase.

## Estrutura

- index.html: tela principal da tabela de cotas
- login.html: autenticacao
- auth.js: validacao de sessao e operacoes de sincronizacao de dados
- firebase-config.js: configuracao do Firebase Auth e Realtime Database
- gerar-hash.html: utilitario SHA-256

## O que foi modernizado

- Interface modernizada em index/login/gerar-hash
- Feedback in-app (toasts/mensagens) no lugar de alertas nativos nas telas principais
- Login migrado para validacao real via Firebase Auth (email + senha)
- Remocao de comparacao local de hash de senha no navegador

## Configuracao do Firebase (obrigatorio)

Esta aplicacao agora usa login real do Firebase Auth.

1. No console do Firebase, habilite o provedor Email/Senha.
2. Crie o usuario autorizado (email e senha).
3. Em firebase-config.js, ajuste o mapeamento USERNAME_TO_EMAIL para o usuario desejado.

Exemplo:

```js
const USERNAME_TO_EMAIL = {
	Eduardo: "seu-email@dominio.com"
};
```

Ao logar com usuario Eduardo + senha correta do Firebase, o sistema grava sessao em users/{uid}/auth e libera a index.

## Regras recomendadas do Realtime Database

Para maior seguranca, evite manter dados totalmente publicos.

Exemplo base (ajuste conforme necessidade):

```json
{
	"rules": {
		"dados": {
			"lotofacil2026": {
				".read": "auth != null",
				".write": "auth != null"
			}
		},
		"users": {
			"$uid": {
				".read": "$uid === auth.uid",
				".write": "$uid === auth.uid"
			}
		}
	}
}
```

## Como executar

Projeto estatico: abra login.html via servidor local (Live Server, Vercel, Netlify ou similar).

Importante: evite abrir direto como file:// para nao ter problemas com imports ES modules.

## Migrar para outro projeto Firebase (com dados preenchidos)

Sim, e possivel migrar para um novo Firebase sem perder os dados.

### 1) Exportar backup da base atual

Na tela principal (index.html), use o botao:

- 💾 Exportar backup

Isso baixa um JSON com os registros atuais.

### 2) Criar novo projeto no Firebase

No Firebase Console:

1. Crie um novo projeto.
2. Crie um app Web.
3. Copie as credenciais para firebase-config.js:
	- apiKey
	- authDomain
	- projectId
	- storageBucket
	- messagingSenderId
	- appId
	- databaseURL
4. Em Authentication > Sign-in method, ative Email/Password.
5. Crie o usuario de login.
6. Ajuste USERNAME_TO_EMAIL em firebase-config.js.

### 3) Importar os dados no novo projeto

Com o app apontando para o novo Firebase e logado:

1. Abra index.html.
2. Clique em 📥 Importar backup.
3. Selecione o JSON exportado.
4. O app carrega os dados localmente e sincroniza automaticamente para o novo Firebase.

### 4) Validacao rapida

1. Abra a mesma conta em outro dispositivo.
2. Confirme se a tabela e totais aparecem iguais.
3. Marque/desmarque um mes e confirme se sincroniza em tempo real.