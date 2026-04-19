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