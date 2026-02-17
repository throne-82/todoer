# throne82 todo (Angular + Tailwind + Firebase)

MVP de app web To-Do minimalista, com sidebar de listas coloridas, board vertical por seções (`WIP`, `TODO`, `DONE`), autenticação por email/senha, tema light/dark e persistência no Firestore.

## Stack
- Frontend: Angular 21 (standalone + TypeScript)
- UI: TailwindCSS v4 + CSS variables
- Backend: Firebase Auth + Firestore (SDK modular)
- Deploy: Firebase Hosting

## Decisão técnica (Firebase)
Foi usado **Firebase SDK modular** (`firebase/*`) em vez de AngularFire, porque no momento deste projeto a versão estável do AngularFire não acompanha Angular 21.

## Estrutura de pastas
```text
src/app/
  auth/
    auth.guard.ts
    login-page.component.*
  app-shell/
    app-shell.component.*
    lists-sidebar.component.*
    tasks-board.component.*
    task-item.component.*
    list-modal.component.*
  firebase/
    firebase.client.ts
    auth.service.ts
    lists.service.ts
    tasks.service.ts
  shared/
    models.ts
    theme.service.ts
```

## Funcionalidades implementadas
- Auth Email/Senha (`/login` e `/app`)
- Login restrito ao email `throneeight2@gmail.com`
- Guard de rota: não autenticado -> `/login`
- Sidebar com:
  - `All Tasks`
  - listas coloridas
  - `+ Add List`
  - edição e exclusão de lista
- Board vertical com seções `WIP`, `TODO`, `DONE` (não kanban)
- Ícones de status:
  - `todo`: quadrado vazio
  - `wip`: quadrado diagonal meio preenchido
  - `done`: quadrado preenchido
- Tarefa `done` com opacidade menor + texto riscado
- Clique no ícone cicla status: `TODO -> WIP -> DONE -> TODO`
- Reordenação por `updatedAt`:
  - `WIP`: mais recente no topo
  - `TODO`: mais recente no topo
  - `DONE`: mais recente no final (para cumprir o comportamento de “ir para baixo”)
- CRUD de listas e tarefas
- Filtro por lista (default = `All Tasks`)
- Tema light/dark com persistência (`localStorage`) via classe `dark` no `body`

## Comportamento ao excluir lista
Ao deletar uma lista, o app **deleta também todas as tarefas daquela lista** (cascade delete via batch no Firestore).

## Modelo de dados (Firestore)
- `lists`
  - `{ id, userId, name, color, createdAt, updatedAt }`
- `tasks`
  - `{ id, userId, listId, title, status: "todo"|"wip"|"done", createdAt, updatedAt }`

## Pré-requisitos
- Node.js 20+ (LTS recomendado)
- Conta Firebase
- Firebase CLI (`npm i -g firebase-tools`)

## Setup Firebase
1. Crie um projeto Firebase no console.
2. Ative **Authentication > Email/Password**.
3. Ative **Firestore Database** (modo production).
4. Em **Project Settings > Your apps > Web app**, copie as credenciais.
5. Preencha `src/environments/environment.ts` e `src/environments/environment.development.ts`:

```ts
firebase: {
  apiKey: '...'
  authDomain: '...'
  projectId: '...'
  storageBucket: '...'
  messagingSenderId: '...'
  appId: '...'
}
```

6. Substitua `YOUR_FIREBASE_PROJECT_ID` em `.firebaserc`.

## Regras do Firestore
As regras estão em `firestore.rules` e restringem acesso para docs com `userId == request.auth.uid`.

Deploy das regras/indexes:

```bash
firebase deploy --only firestore
```

## Rodar localmente
```bash
npm install
npm start
```

Abra `http://localhost:4200`.

## Build
```bash
npm run build
```

## Deploy (Hosting)
1. Login no Firebase CLI:
```bash
firebase login
```

2. (Se necessário) inicialize no diretório:
```bash
firebase init hosting firestore
```

Use:
- `public`: `dist/todoer/browser`
- `single-page app`: `yes`
- `overwrite index.html`: `no`

3. Gere build de produção e publique:
```bash
npm run build
firebase deploy
```

## Observações
- UI construída para desktop e mobile.
- Sem drag-and-drop.
- Sem kanban.
