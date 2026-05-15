# 🐔 Galinha Clicker

Jogo de clicker estilo "Cookie Clicker" onde você clica em uma galinha para coletar ovos,
compra melhorias e desbloqueia conquistas.

---

## 📁 Estrutura de Pastas

```
galinha-clicker/
├── index.html                  → Ponto de entrada HTML (carrega tudo)
├── README.md                   → Este arquivo
│
├── assets/
│   └── css/
│       ├── reset.css           → Normalização cross-browser/OS
│       ├── theme.css           → Variáveis de cor, fonte e espaçamento
│       ├── layout.css          → Estrutura: header + grid 3 colunas
│       ├── components.css      → Estilos de cada componente da UI
│       ├── animations.css      → Keyframes e classes de animação
│       └── responsive.css      → Breakpoints para mobile/tablet/desktop
│
└── src/
    ├── engine/
    │   ├── state.js            → Estado central do jogo (ovos, cliques, etc.)
    │   ├── levels.js           → Sistema de níveis/ranks do jogador
    │   ├── click.js            → Eventos de clique (mouse, touch, teclado)
    │   ├── loop.js             → Loop de produção automática + auto-save
    │   └── init.js             → Inicialização e boot do jogo
    │
    ├── shop/
    │   └── upgrades.js         → Catálogo de upgrades e lógica de compra
    │
    ├── milestones/
    │   └── milestones.js       → Definição e verificação de conquistas
    │
    ├── storage/
    │   └── save.js             → Salvar/carregar progresso (localStorage)
    │
    └── ui/
        ├── ui.js               → Renderização principal da interface
        ├── floatText.js        → Texto flutuante ao clicar
        └── notification.js     → Notificações toast temporárias
```

---

## 🚀 Como Rodar

### VS Code (recomendado)
1. Instale a extensão **Live Server**
2. Clique com botão direito em `index.html` → **Open with Live Server**

### Qualquer SO (sem instalar nada)
Basta abrir `index.html` diretamente no navegador (duplo clique no arquivo).

> ⚠️ **Atenção:** Para carregar os módulos JS separados via `<script src="">`,
> alguns browsers bloqueiam carregamento de arquivo local com `file://`.
> Use o Live Server ou outro servidor local (ex: `npx serve .`).

---

## 📱 Portabilidade

| Plataforma        | Suporte |
|-------------------|---------|
| Windows (Chrome, Edge, Firefox) | ✅ |
| macOS (Safari, Chrome, Firefox) | ✅ |
| Linux (Firefox, Chrome)         | ✅ |
| iOS (Safari, Chrome)            | ✅ |
| Android (Chrome, Samsung)       | ✅ |
| Tablet (iPad, Android)          | ✅ |
| Modo escuro do sistema          | ✅ |
| Reduzir movimento (acessib.)    | ✅ |

---

## 🔧 Tecnologias

- HTML5 semântico com atributos ARIA
- CSS3 com variáveis, Grid, Flexbox e `clamp()`
- JavaScript ES6+ modular (sem dependências externas)
- localStorage para persistência de dados
