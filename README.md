# VideoShare Mobile

Aplicativo desenvolvido com [Expo](https://expo.dev) e React Native, utilizando o roteador expo-router e a navegação do ecossistema React Navigation.

## Apresentação

Este repositório contém um trabalho acadêmico da disciplina 28743 - DESENVOLVIMENTO MOBILE.

- Aluno(a): Vitor Mateus Weirich (weirichvitor@gmail.com)
- Turma: EAD54-12
- Professor(a): Alysson Oliveira
- Disciplina: 28743 - DESENVOLVIMENTO MOBILE

Documento de requisitos e protótipos (wireframes/mockups):

- Caminho no repositório: `layout (Protótipo)/Requisitos e Propósta de Layout (Protótipo).md`
- Link direto (GitHub): https://github.com/vitorweirich/video-share-mobile/blob/master/layout%20(Protótipo)/Requisitos%20e%20Propósta%20de%20Layout%20(Protótipo).md

Principais requisitos funcionais definidos no documento:

- Autenticação (Login e Cadastro)
- Gerenciamento de vídeos: Meus Vídeos (listagem), Visualização de Vídeo e Envio de Vídeo

## Estrutura básica do projeto

Pastas e arquivos principais:

- `app/` — Páginas (file-based routing via expo-router)
  - `login.tsx` — Tela de Login
  - `cadastro.tsx` — Tela de Cadastro
  - `(tabs)/_layout.tsx` — Layout das abas
  - `(tabs)/videos/index.tsx` — Tela Meus Vídeos (listagem)
  - `(tabs)/upload/index.tsx` — Tela de Envio de Vídeo
  - `video/[id].tsx` — Tela de Visualização de Vídeo (detalhes/reprodução)
  - `_layout.tsx`, `+not-found.tsx` — Arquivos de layout e fallback
- `components/` — Componentes reutilizáveis de UI
- `contexts/AuthContext.tsx` — Contexto de autenticação
- `store/videos.tsx` — Estado/armazenamento local de vídeos
- `constants/api.ts` — Configurações auxiliares (endpoints, etc.)
- `assets/` — Imagens, fontes e ícones
- `layout (Protótipo)/` — Protótipos e documento de requisitos

Telas previstas/implementadas:

- Login (`app/login.tsx`)
- Cadastro (`app/cadastro.tsx`)
- Meus Vídeos / Listagem (`app/(tabs)/videos/index.tsx`)
- Envio de Vídeo (`app/(tabs)/upload/index.tsx`)
- Visualização de Vídeo (`app/video/[id].tsx`)

Dependências principais (parcial):

- Expo e ecossistema: `expo`, `expo-router`, `expo-splash-screen`, `expo-status-bar`, `expo-constants`, `expo-font`, `expo-blur`, `expo-haptics`, `expo-linking`, `expo-symbols`
- Navegação: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/elements`, `react-native-screens`, `react-native-safe-area-context`
- Gestos/Animações: `react-native-gesture-handler`, `react-native-reanimated`
- Vídeo e arquivos: `expo-av` (reprodução de vídeo), `expo-document-picker` (seleção de arquivos)
- Utilidades: `@react-native-async-storage/async-storage`, `nanoid`
- UI/Ícones: `@expo/vector-icons`

Scripts úteis (package.json):

- `yarn start` — Inicia o servidor do Expo
- `yarn android` — Executa no Android (build nativo via Expo)
- `yarn ios` — Executa no iOS (requer macOS/Xcode)
- `yarn web` — Executa no navegador
- `yarn lint` — Linting com ESLint/Expo

## Como executar

1. Instale as dependências: `yarn` (ou `npm install`)
2. Inicie o app: `yarn start` (ou `npx expo start`)
3. Abra no emulador Android, iOS ou no Expo Go conforme sua preferência.

Este projeto usa [file-based routing](https://docs.expo.dev/router/introduction): as rotas são definidas pelos arquivos dentro da pasta `app/`.

## Recursos úteis

- Documentação do Expo: https://docs.expo.dev/
- Guia do expo-router: https://docs.expo.dev/router/introduction/
- React Navigation: https://reactnavigation.org/
