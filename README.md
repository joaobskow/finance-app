## Como funciona

- **Login/Cadastro** (`/login`): cria conta com nome/e-mail/senha via Firebase
  Auth. Ao cadastrar, cria automaticamente o documento do usuário e as metas
  padrão (Alimentação, Transporte, Lazer) no Firestore.
- **Home** (`/`): mostra saldo, metas e últimas transações — tudo em tempo
  real (via `onSnapshot`), então qualquer mudança no banco atualiza a tela na
  hora.
- **Adicionar Gasto**: abre um modal, grava a transação em
  `users/{uid}/transactions`, desconta do saldo (`users/{uid}.balance`) e soma
  no "spent" da meta da categoria escolhida.
- **Escanear Nota**: por enquanto mostra um aviso — a leitura automática de
  nota fiscal (OCR) é um passo futuro (ex: integrar uma API de OCR e cair no
  mesmo formulário de "Adicionar Gasto" com os campos pré-preenchidos).
- **Transactions** (`/transactions`): lista completa das transações do
  usuário logado.
- **Profile** (`/profile`): mostra nome/e-mail e tem o botão de logout.
- **Stats** (`/stats`): placeholder para os gráficos da próxima etapa.

Cada usuário só enxerga os próprios dados: as regras em `firestore.rules`
garantem que `users/{uid}` só pode ser lido/escrito pelo próprio dono
(`request.auth.uid == userId`).

## Estrutura de pastas

```
finance-app/
├── firestore.rules              # regras de segurança do Firestore
├── .env.example                  # modelo das variáveis de ambiente
├── src/
│   ├── principal.jsx              # ponto de entrada do React
│   ├── Aplicativo.jsx             # componente raiz (rotas + providers)
│   ├── estilos.css                # CSS global (fontes, variáveis de tema)
│   ├── firebase/
│   │   └── configuracao.js        # inicializa o Firebase (Auth + Firestore)
│   ├── context/
│   │   ├── ContextoAutenticacao.jsx  # login, cadastro, logout, usuário atual
│   │   └── ContextoTema.jsx          # tema claro/escuro/sistema
│   ├── services/
│   │   └── servicoFirestore.js    # leitura/escrita de saldo, metas, transações
│   ├── routes/
│   │   └── RotaProtegida.jsx      # bloqueia telas sem login
│   ├── utils/
│   │   ├── formatacao.js          # formatação de moeda e data
│   │   └── periodo.js             # cálculo de períodos (semana/mês/ano)
│   ├── components/
│   │   ├── Cabecalho.jsx
│   │   ├── CartaoSaldo.jsx
│   │   ├── BotoesAcao.jsx
│   │   ├── CartaoMetas.jsx
│   │   ├── GraficoCategorias.jsx
│   │   ├── ListaTransacoes.jsx
│   │   ├── BarraNavegacao.jsx
│   │   ├── AlternadorTema.jsx
│   │   ├── ModalAdicionarGasto.jsx
│   │   ├── ModalAdicionarSaldo.jsx
│   │   └── ModalEditarMetas.jsx
│   └── screens/
│       ├── TelaLogin.jsx
│       ├── TelaInicio.jsx
│       ├── TelaTransacoes.jsx
│       ├── TelaEstatisticas.jsx
│       └── TelaPerfil.jsx
```

> Nota: os nomes de arquivo, componentes e hooks estão em português. Nomes
> técnicos vindos do Firebase (`onSnapshot`, `increment`, etc.) e os campos
> salvos no banco (`category`, `amount`, `createdAt`...) continuam em inglês
> — são convenções da própria biblioteca e mudar os campos quebraria dados
> já salvos no Firestore.



## Instalar o app (PWA)

O app é um PWA (Progressive Web App): quando alguém visita o site, o
navegador pode oferecer "instalar" o app na tela inicial/área de trabalho,
o que faz ele abrir em janela própria, sem barra de endereço. Isso é
controlado pelos arquivos `public/manifest.json`, `public/sw.js` e pelo
componente `PromptInstalacao.jsx`, que mostra um banner customizado (em vez
de depender só do popup padrão do navegador).

**Limitações importantes:**
- Só funciona em **HTTPS** (ou `localhost` durante o desenvolvimento) —
  navegadores bloqueiam PWAs em HTTP puro.
- Funciona no **Chrome, Edge e outros navegadores baseados em Chromium**
  (Android e desktop). O evento que dispara o prompt (`beforeinstallprompt`)
  **não existe no Safari/iOS** — lá a instalação é manual, pelo menu
  Compartilhar > "Adicionar à Tela de Início". Não tem como abrir esse
  prompt via código no iOS.
- O banner só aparece se o navegador considerar o site "instalável"
  (manifest válido, ícones, service worker registrado, HTTPS) e não
  aparece de novo por 7 dias se o usuário clicar em "Agora não" — esse
  prazo está no `STORAGE_KEY`/`DIAS_ATE_PERGUNTAR_DE_NOVO` dentro de
  `PromptInstalacao.jsx`, dá pra ajustar.
- Os ícones em `public/icons/` foram gerados automaticamente com a
  identidade visual do app; troque pelos seus próprios se quiser um ícone
  diferente (mesmo nome de arquivo, mesmo tamanho: 192x192 e 512x512).

## Próximos passos

- Gráfico real em "Gastos por Categoria" e na tela de Stats (ex: `recharts`)
- OCR de notas fiscais no "Escanear Nota"
- Editar/excluir transações e metas pela interface
- Recuperação de senha ("Esqueci minha senha")
