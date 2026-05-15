/*
================================================================
  EcoAgro Monitor — script.js
  Lógica principal: gráficos, simulador, slider, quiz, animações
================================================================
  MÓDULOS DESTE ARQUIVO:
    1. Inicialização e utilitários
    2. Navbar: scroll + menu mobile
    3. Partículas do Hero
    4. Contadores animados (hero stats)
    5. Painel: gráficos Chart.js + atualização em tempo real
    6. Simulador sustentável
    7. Slider Antes × Depois
    8. Quiz interativo
    9. Botão voltar ao topo
   10. Destaque de nav ativo no scroll

  DEPENDÊNCIAS (via CDN no HTML):
    - Chart.js 4.x   → window.Chart
    - AOS 2.x        → window.AOS
    - Font Awesome   → via CSS, sem referência aqui

  COMPATIBILIDADE:
    Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
    iOS Safari 13+, Android Chrome 80+
================================================================
*/

'use strict'; // Modo estrito: evita bugs silenciosos

/* ============================================================
   1. INICIALIZAÇÃO GERAL
   Espera o DOM estar completamente carregado antes de executar
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initNavbar();
  initHeroParticles();
  initHeroCounters();
  initCharts();
  initLiveUpdate();
  initSimulator();
  initSlider();
  initQuiz();
  initBackToTop();
  initScrollSpy();
});


/* ============================================================
   2. AOS — Animações ao Rolar
   Inicializa a biblioteca AOS com configurações globais
============================================================ */
function initAOS() {
  AOS.init({
    duration: 700,        // Duração da animação em ms
    once: true,           // Anima apenas na primeira vez que aparece
    offset: 60,           // Distância antes do elemento entrar na tela
    easing: 'ease-out',   // Curva de aceleração suave
  });
}


/* ============================================================
   3. NAVBAR
   - Adiciona classe .scrolled ao rolar (muda transparência)
   - Toggle do menu mobile (hamburguer)
   - Fecha menu mobile ao clicar num link
============================================================ */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Adiciona/remove classe 'scrolled' conforme o scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true }); // passive: true melhora performance do scroll

  // Abre/fecha menu mobile
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Fecha o menu mobile ao clicar em qualquer link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    });
  });
}


/* ============================================================
   4. PARTÍCULAS DO HERO
   Cria partículas CSS animadas (bolinhas/pontos de luz) no fundo
   Quantidade adaptada ao tamanho da tela para melhor performance
============================================================ */
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  // Menos partículas em mobile para preservar performance
  const count = window.innerWidth < 768 ? 20 : 40;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'particle';

    // Tamanho aleatório entre 2px e 6px
    const size = Math.random() * 4 + 2;
    // Posição horizontal aleatória
    const left = Math.random() * 100;
    // Duração aleatória entre 8s e 20s
    const duration = Math.random() * 12 + 8;
    // Atraso para não iniciarem todos juntos
    const delay = Math.random() * 10;
    // Cor: verde claro ou amarelo, aleatório
    const color = Math.random() > 0.5 ? 'rgba(82,183,136,0.6)' : 'rgba(244,208,63,0.4)';

    el.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${left}%;
      bottom:-10px;
      background:${color};
      animation-duration:${duration}s;
      animation-delay:${delay}s;
    `;

    container.appendChild(el);
  }
}


/* ============================================================
   5. CONTADORES ANIMADOS — Hero Stats
   Anima os números subindo de 0 até o valor alvo (data-target)
   Usa IntersectionObserver: inicia apenas quando visível
============================================================ */
function initHeroCounters() {
  const nums = document.querySelectorAll('.stat-num');

  // Função que anima um único contador
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2000; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing ease-out: começa rápido, desacelera no final
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Observa quando os contadores entram na viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target); // Anima apenas uma vez
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(n => observer.observe(n));
}


/* ============================================================
   6. GRÁFICOS — Chart.js
   Inicializa todos os mini gráficos dos cards do painel
   e o gráfico de radar do simulador
============================================================ */

// Configuração de cores padrão (reusada em todos os gráficos)
const chartColors = {
  green:  { line: '#52B788', fill: 'rgba(82,183,136,0.15)' },
  blue:   { line: '#4FC3F7', fill: 'rgba(79,195,247,0.15)' },
  yellow: { line: '#F4D03F', fill: 'rgba(244,208,63,0.15)' },
  teal:   { line: '#74C69D', fill: 'rgba(116,198,157,0.15)' },
};

// Objeto para guardar referências dos gráficos (para atualizar depois)
const charts = {};

function initCharts() {
  // Desativa animações globais do Chart.js em conexões lentas (preferência do sistema)
  Chart.defaults.animation.duration = 800;
  Chart.defaults.color = 'rgba(116,198,157,0.7)';
  Chart.defaults.font.family = "'Poppins', sans-serif";

  createMiniChart('chart-umidade', chartColors.green, gerarDados(72, 12, 5));
  createMiniChart('chart-agua',    chartColors.blue,  gerarDados(35, 12, 8));
  createMiniChart('chart-energia', chartColors.yellow, gerarDados(87, 12, 4));
  createMiniChart('chart-ar',      chartColors.teal,  gerarDados(94, 12, 3));
  createWideChart('chart-producao');
  createRadarChart('chart-radar');
}

/**
 * Gera um array de dados simulados (variação aleatória em torno de um valor base)
 * @param {number} base     - Valor central
 * @param {number} count    - Quantidade de pontos
 * @param {number} variance - Variação máxima (±)
 * @returns {number[]}
 */
function gerarDados(base, count, variance) {
  return Array.from({ length: count }, () =>
    Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance * 2))
  );
}

/**
 * Cria um mini gráfico de linha dentro de um card
 * O canvas DEVE estar dentro de uma .chart-wrap com altura fixa no CSS
 * para que o Chart.js respeite as dimensões corretamente.
 * @param {string} id     - ID do canvas
 * @param {object} colors - Objeto de cores { line, fill }
 * @param {number[]} data - Array de dados
 */
function createMiniChart(id, colors, data) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  charts[id] = new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: colors.line,
        backgroundColor: colors.fill,
        borderWidth: 2,
        pointRadius: 0,       // Sem pontos para visual limpo
        tension: 0.4,         // Curva suave
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Altura controlada pelo wrapper CSS (.chart-wrap)
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        x: { display: false },
        y: { display: false },
      },
      animation: { duration: 400 },
    }
  });
}

/**
 * Cria o gráfico de área largo (card de produção agrícola)
 * O canvas deve estar dentro de .wide-chart-wrap com height: 140px no CSS
 */
function createWideChart(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  const semanas = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7'];
  const dados   = [3.1, 3.4, 3.8, 4.0, 4.3, 4.6, 4.8];

  charts[id] = new Chart(canvas, {
    type: 'line',
    data: {
      labels: semanas,
      datasets: [{
        label: 'Toneladas',
        data: dados,
        borderColor: '#52B788',
        backgroundColor: 'rgba(82,183,136,0.15)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#52B788',
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,31,22,0.9)',
          borderColor: '#52B788',
          borderWidth: 1,
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} toneladas`,
          }
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: 'rgba(116,198,157,0.7)', font: { size: 11 } },
        },
        y: {
          min: 0,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: 'rgba(116,198,157,0.7)',
            font: { size: 11 },
            callback: v => v + 't',
          },
        },
      },
    }
  });
}

/**
 * Cria o gráfico de radar do simulador
 * Mostra o perfil multidimensional da fazenda
 */
function createRadarChart(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  charts[id] = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: ['Água', 'Energia', 'CO₂', 'Produção', 'Solo'],
      datasets: [{
        label: 'Sua Fazenda',
        data: [90, 87, 88, 85, 82],
        borderColor: '#52B788',
        backgroundColor: 'rgba(82,183,136,0.2)',
        borderWidth: 2,
        pointBackgroundColor: '#52B788',
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,31,22,0.9)',
          borderColor: '#52B788',
          borderWidth: 1,
        },
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          grid:      { color: 'rgba(255,255,255,0.1)' },
          angleLines:{ color: 'rgba(255,255,255,0.1)' },
          pointLabels: {
            color: 'rgba(116,198,157,0.9)',
            font: { size: 12 }
          },
          ticks: { display: false },
        }
      }
    }
  });
}


/* ============================================================
   7. ATUALIZAÇÃO EM TEMPO REAL — Painel
   Simula sensores IoT atualizando os dados a cada 3 segundos
   Atualiza os valores nos cards e nos mini gráficos
============================================================ */
function initLiveUpdate() {
  // Estado atual dos valores (atualizado a cada ciclo)
  const state = {
    umidade: { val: 72, min: 60, max: 85, barId: 'bar-umidade', valId: 'val-umidade', chartId: 'chart-umidade', speed: 2 },
    agua:    { val: 35, min: 20, max: 55, barId: 'bar-agua',    valId: 'val-agua',    chartId: 'chart-agua',    speed: 3, rawVal: 320 },
    energia: { val: 87, min: 75, max: 95, barId: 'bar-energia', valId: 'val-energia', chartId: 'chart-energia', speed: 1 },
    ar:      { val: 94, min: 88, max: 98, barId: 'bar-ar',      valId: 'val-ar',      chartId: 'chart-ar',      speed: 1 },
  };

  // Atualiza um valor com pequena variação aleatória
  function tick() {
    Object.values(state).forEach(s => {
      // Variação pequena a cada tick
      s.val += (Math.random() - 0.5) * s.speed;
      s.val  = Math.max(s.min, Math.min(s.max, s.val));
      const rounded = Math.round(s.val);

      // Atualiza o valor no card
      const valEl = document.getElementById(s.valId);
      if (valEl) {
        // Valor especial para água: converte % para L/h
        if (s.valId === 'val-agua') {
          valEl.textContent = Math.round(s.val * 9.1); // ~320 L/h base
        } else {
          valEl.textContent = rounded;
        }
      }

      // Atualiza barra de progresso
      const barEl = document.getElementById(s.barId);
      if (barEl) barEl.style.width = rounded + '%';

      // Adiciona novo ponto ao mini gráfico e remove o mais antigo
      const chartInst = charts[s.chartId];
      if (chartInst) {
        const ds = chartInst.data.datasets[0];
        ds.data.push(rounded);
        if (ds.data.length > 20) ds.data.shift(); // Mantém no máximo 20 pontos
        chartInst.update('none'); // 'none' = sem animação para updates rápidos
      }
    });
  }

  // Atualiza a cada 3 segundos
  setInterval(tick, 3000);
}


/* ============================================================
   8. SIMULADOR SUSTENTÁVEL
   Lê o estado dos botões toggle e recalcula as métricas.
   Todas as fórmulas são simplificadas para fins educativos.
============================================================ */
function initSimulator() {
  // Estado inicial: todas as opções eco ativas
  const simState = {
    irrigacao:   'inteligente',
    energia:     'solar',
    fertilizante:'organico',
    colheita:    'automatizado',
  };

  // Seleciona todos os botões toggle do simulador
  const btns = document.querySelectorAll('.toggle-btn');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      const value = btn.dataset.value;

      // Remove ativo dos irmãos do mesmo grupo
      document.querySelectorAll(`.toggle-btn[data-group="${group}"]`)
        .forEach(b => b.classList.remove('active'));

      // Ativa o botão clicado
      btn.classList.add('active');

      // Atualiza estado
      simState[group] = value;

      // Recalcula e exibe resultados
      updateSimulator(simState);
    });
  });

  // Botão de reset: volta tudo para eco
  document.getElementById('btnResetSim').addEventListener('click', () => {
    btns.forEach(btn => {
      const isEco = ['inteligente','solar','organico','automatizado'].includes(btn.dataset.value);
      btn.classList.toggle('active', isEco);
      if (isEco) simState[btn.dataset.group] = btn.dataset.value;
    });
    updateSimulator(simState);
  });

  // Executa uma vez para exibir estado inicial
  updateSimulator(simState);
}

/**
 * Recalcula todas as métricas do simulador com base nas escolhas do usuário
 * e atualiza os elementos visuais da seção de resultados.
 * @param {object} state - Estado atual do simulador
 */
function updateSimulator(state) {
  // ----- Cálculo do Gasto de Água -----
  // Irrigação inteligente economiza 40%, qualquer outra aumenta
  let aguaLh    = state.irrigacao === 'inteligente' ? 320 : 550;
  let aguaPct   = state.irrigacao === 'inteligente' ? 35  : 65;
  let aguaMsg   = state.irrigacao === 'inteligente'
    ? '🟢 40% abaixo do modelo convencional'
    : '🔴 Consumo elevado — use irrigação inteligente';
  let aguaMsgClass = state.irrigacao === 'inteligente' ? '' : 'bad';

  // ----- Cálculo de CO₂ -----
  let co2Base = 6.0; // Toneladas em modo convencional
  if (state.energia     === 'solar')       co2Base -= 2.4;
  if (state.fertilizante=== 'organico')    co2Base -= 1.2;
  if (state.colheita    === 'automatizado') co2Base -= 0.8;
  if (state.irrigacao   === 'inteligente') co2Base -= 0.4;
  const co2 = Math.max(0.2, co2Base).toFixed(1);
  const co2Pct = Math.round((co2 / 6.0) * 100);
  let co2Msg = co2 < 2.0 ? '🟢 Emissões muito baixas — excelente!' :
               co2 < 4.0 ? '🟡 Emissões moderadas — melhore a energia'
                         : '🔴 Emissões altas — revise as práticas';
  let co2Class = co2 < 2.0 ? '' : co2 < 4.0 ? 'warn' : 'bad';

  // ----- Cálculo de Produtividade -----
  let prodPct = 50;
  if (state.irrigacao   === 'inteligente')  prodPct += 15;
  if (state.fertilizante=== 'organico')     prodPct += 10;
  if (state.colheita    === 'automatizado') prodPct += 12;
  if (state.energia     === 'solar')        prodPct +=  8;
  prodPct = Math.min(100, prodPct);
  const prodLabel = prodPct >= 85 ? `Alta (+${prodPct - 50}%)` :
                    prodPct >= 65 ? `Média (+${prodPct - 50}%)` : 'Baixa';
  let prodMsg = prodPct >= 85 ? '🟢 Máxima eficiência no campo' :
                prodPct >= 65 ? '🟡 Produção mediana — otimize as práticas'
                              : '🔴 Produção baixa — revise todos os sistemas';
  let prodClass = prodPct >= 85 ? '' : prodPct >= 65 ? 'warn' : 'bad';

  // ----- Pontuação Ecológica (0–100) -----
  let score = 0;
  if (state.irrigacao   === 'inteligente')  score += 25;
  if (state.energia     === 'solar')        score += 25;
  if (state.fertilizante=== 'organico')     score += 25;
  if (state.colheita    === 'automatizado') score += 25;
  const scoreLabel = score === 100 ? '🌟 Fazenda Certificada Sustentável!' :
                     score >= 75   ? '🟢 Quase perfeita! Mais um ajuste...' :
                     score >= 50   ? '🟡 Progresso! Continue melhorando.' :
                     score >= 25   ? '🟠 Atenção: muitas práticas convencionais.'
                                   : '🔴 Fazenda convencional — alto impacto.';
  const scoreClass = score >= 75 ? '' : score >= 50 ? 'warn' : 'bad';

  // ----- Atualiza o DOM -----
  setResultItem('res-agua',    `${aguaLh} L/h`,    'rbar-agua',    aguaPct,  'msg-agua',    aguaMsg,    aguaMsgClass);
  setResultItem('res-carbono', `${co2} t CO₂`,     'rbar-carbono', co2Pct,   'msg-carbono', co2Msg,     co2Class);
  setResultItem('res-prod',    prodLabel,           'rbar-prod',    prodPct,  'msg-prod',    prodMsg,    prodClass);
  setResultItem('res-score',   `${score} / 100`,   'rbar-score',   score,    'msg-score',   scoreLabel, scoreClass);

  // ----- Atualiza gráfico de radar -----
  updateRadarChart(state);
}

/**
 * Atualiza um item de resultado no painel do simulador
 */
function setResultItem(valId, valText, barId, barPct, msgId, msgText, msgClass) {
  const v = document.getElementById(valId);
  const b = document.getElementById(barId);
  const m = document.getElementById(msgId);
  if (v) v.textContent = valText;
  if (b) b.style.width = barPct + '%';
  if (m) {
    m.textContent  = msgText;
    m.className    = 'result-msg ' + (msgClass || '');
  }
}

/**
 * Recalcula e atualiza o gráfico de radar com base no estado do simulador
 */
function updateRadarChart(state) {
  const chart = charts['chart-radar'];
  if (!chart) return;

  // Calcula pontuação por dimensão
  const agua    = state.irrigacao    === 'inteligente'  ? 90 : 45;
  const energia = state.energia      === 'solar'        ? 87 : 30;
  const co2     = (energia > 50 && state.fertilizante === 'organico') ? 88 : 40;
  const prod    = state.colheita     === 'automatizado' ? 85 : 55;
  const solo    = state.fertilizante === 'organico'     ? 82 : 38;

  chart.data.datasets[0].data = [agua, energia, co2, prod, solo];

  // Muda a cor do gráfico conforme a pontuação geral
  const avg = (agua + energia + co2 + prod + solo) / 5;
  const cor = avg > 70 ? '#52B788' : avg > 50 ? '#F4D03F' : '#e74c3c';
  chart.data.datasets[0].borderColor      = cor;
  chart.data.datasets[0].backgroundColor  = cor.replace(')', ',0.15)').replace('rgb', 'rgba');
  chart.data.datasets[0].pointBackgroundColor = cor;

  chart.update();
}


/* ============================================================
   9. SLIDER ANTES × DEPOIS
   Permite arrastar (mouse e touch) para revelar a cena sustentável.
   Usa clip-path: inset para cortar a camada superior.
============================================================ */
function initSlider() {
  const wrapper  = document.querySelector('.slider-wrapper');
  const after    = document.getElementById('sliderAfter');
  const divider  = document.getElementById('sliderDivider');

  if (!wrapper || !after || !divider) return;

  let isDragging = false;

  /**
   * Move o slider para a posição X do cursor/toque
   * @param {number} clientX - Posição X do cursor na tela
   */
  function moveSlider(clientX) {
    const rect   = wrapper.getBoundingClientRect();
    let   pct    = (clientX - rect.left) / rect.width;
    pct = Math.max(0.02, Math.min(0.98, pct)); // Limita entre 2% e 98%

    const pctRight = (1 - pct) * 100;

    // clip-path: inset(cima direita baixo esquerda)
    after.style.clipPath   = `inset(0 ${pctRight}% 0 0)`;
    // Posiciona a linha divisória
    divider.style.left     = (pct * 100) + '%';
  }

  // ----- Eventos de mouse -----
  wrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    moveSlider(e.clientX);
  });
  window.addEventListener('mousemove', (e) => {
    if (isDragging) moveSlider(e.clientX);
  });
  window.addEventListener('mouseup', () => { isDragging = false; });

  // ----- Eventos de toque (touch) — iOS/Android -----
  wrapper.addEventListener('touchstart', (e) => {
    isDragging = true;
    moveSlider(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (isDragging) moveSlider(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  // Clique simples (sem arrastar) também move o slider
  wrapper.addEventListener('click', (e) => {
    moveSlider(e.clientX);
  });
}


/* ============================================================
   10. QUIZ INTERATIVO
   Banco de perguntas, lógica de navegação, feedback e resultado.
   Funções principais: showQuestion(), checkAnswer(), showResult()
============================================================ */

// Banco de perguntas do quiz
const PERGUNTAS = [
  {
    pergunta: 'Qual sistema de irrigação economiza mais água no campo?',
    opcoes: [
      'Irrigação por inundação',
      'Irrigação inteligente por gotejamento com sensores',
      'Irrigação por aspersão manual',
      'Não irrigar e depender apenas da chuva',
    ],
    correta: 1,
    explicacao: '✅ A irrigação inteligente usa sensores para aplicar água apenas quando necessário, economizando até 40% em relação a métodos convencionais.',
  },
  {
    pergunta: 'A energia solar pode beneficiar o agronegócio de qual forma?',
    opcoes: [
      'Aumenta as chuvas na região',
      'Não tem utilidade na agricultura',
      'Reduz custos de energia e diminui emissões de CO₂',
      'Substitui o uso de fertilizantes',
    ],
    correta: 2,
    explicacao: '✅ Painéis solares reduzem custos operacionais e eliminam emissões de CO₂ geradas por energia fóssil.',
  },
  {
    pergunta: 'O que é agricultura de precisão?',
    opcoes: [
      'Plantar com medidas exatas de espaçamento',
      'Uso de tecnologia (GPS, drones, IA) para otimizar o uso de recursos no campo',
      'Produzir apenas um tipo de cultivo na fazenda',
      'Agricultura feita somente à mão, sem máquinas',
    ],
    correta: 1,
    explicacao: '✅ Agricultura de precisão usa tecnologia avançada para aplicar insumos no lugar, hora e quantidade certos.',
  },
  {
    pergunta: 'Qual prática ajuda a conservar o solo e reduzir emissões?',
    opcoes: [
      'Queimar os restos de cultura após a colheita',
      'Usar fertilizantes químicos em alta dose',
      'Plantio direto e uso de fertilizantes orgânicos',
      'Arar o solo profundamente todo ano',
    ],
    correta: 2,
    explicacao: '✅ O plantio direto preserva a estrutura do solo, aumenta a matéria orgânica e reduz emissões de carbono.',
  },
  {
    pergunta: 'Qual é o principal benefício de instalar painéis solares em uma fazenda?',
    opcoes: [
      'Produzir sombra para as plantações',
      'Gerar energia limpa e barata para bombas e equipamentos',
      'Atrair mais insetos polinizadores',
      'Impedir que animais entrem na fazenda',
    ],
    correta: 1,
    explicacao: '✅ Energia solar gera eletricidade limpa que alimenta sistemas de irrigação, refrigeração e outras máquinas agrícolas.',
  },
];

// Estado atual do quiz
const quizState = {
  perguntaAtual: 0,
  pontuacao: 0,
  respondida: false,
};

/**
 * Inicializa o quiz: exibe a primeira pergunta e configura os botões
 */
function initQuiz() {
  quizState.perguntaAtual = 0;
  quizState.pontuacao     = 0;
  quizState.respondida    = false;

  showQuestion();

  // Botão "Próxima"
  document.getElementById('btnProxima').addEventListener('click', nextQuestion);

  // Botão "Jogar Novamente"
  document.getElementById('btnReiniciarQuiz').addEventListener('click', () => {
    // Esconde resultado, mostra quiz
    document.getElementById('quizResult').style.display  = 'none';
    document.getElementById('quizQuestion').style.display = '';
    document.getElementById('quizOptions').style.display  = '';
    document.getElementById('quizCounter').style.display  = '';
    document.getElementById('quizFeedback').textContent   = '';
    quizState.perguntaAtual = 0;
    quizState.pontuacao     = 0;
    showQuestion();
  });
}

/**
 * Renderiza a pergunta atual no DOM
 */
function showQuestion() {
  const p       = PERGUNTAS[quizState.perguntaAtual];
  const total   = PERGUNTAS.length;
  const current = quizState.perguntaAtual + 1;
  const letters = ['A', 'B', 'C', 'D'];

  quizState.respondida = false;

  // Atualiza progresso e contador
  document.getElementById('quizProgress').style.width = ((current - 1) / total * 100) + '%';
  document.getElementById('quizCounter').textContent  = `Pergunta ${current} de ${total}`;
  document.getElementById('quizQuestion').textContent = p.pergunta;
  document.getElementById('quizFeedback').textContent = '';
  document.getElementById('btnProxima').style.display = 'none';

  // Gera os botões de opção dinamicamente
  const optContainer = document.getElementById('quizOptions');
  optContainer.innerHTML = '';

  p.opcoes.forEach((opcao, idx) => {
    const btn = document.createElement('button');
    btn.className     = 'quiz-option';
    btn.dataset.letter = letters[idx];
    btn.dataset.index  = idx;
    btn.textContent   = opcao;

    btn.addEventListener('click', () => {
      if (!quizState.respondida) checkAnswer(idx);
    });

    optContainer.appendChild(btn);
  });
}

/**
 * Verifica a resposta escolhida e exibe feedback visual
 * @param {number} escolhido - Índice da opção escolhida
 */
function checkAnswer(escolhido) {
  quizState.respondida = true;
  const p        = PERGUNTAS[quizState.perguntaAtual];
  const opcoes   = document.querySelectorAll('.quiz-option');
  const feedback = document.getElementById('quizFeedback');

  // Desabilita todos os botões após a resposta
  opcoes.forEach(btn => {
    btn.disabled = true;
    const idx = parseInt(btn.dataset.index, 10);
    if (idx === p.correta)  btn.classList.add('correct');
    if (idx === escolhido && idx !== p.correta) btn.classList.add('wrong');
  });

  // Atualiza pontuação e feedback
  if (escolhido === p.correta) {
    quizState.pontuacao++;
    feedback.textContent = p.explicacao;
    feedback.style.color = 'var(--verde-claro)';
  } else {
    feedback.textContent = '❌ ' + p.explicacao;
    feedback.style.color = '#e74c3c';
  }

  // Exibe botão de avançar
  const btnProx = document.getElementById('btnProxima');
  btnProx.style.display = 'inline-flex';
  btnProx.textContent   = quizState.perguntaAtual < PERGUNTAS.length - 1
    ? 'Próxima →'
    : 'Ver Resultado';
}

/**
 * Avança para a próxima pergunta ou mostra o resultado final
 */
function nextQuestion() {
  quizState.perguntaAtual++;

  if (quizState.perguntaAtual < PERGUNTAS.length) {
    showQuestion();
  } else {
    showResult();
  }
}

/**
 * Exibe a tela de resultado final com pontuação e selo ecológico
 */
function showResult() {
  const score = quizState.pontuacao;
  const total = PERGUNTAS.length;

  // Esconde a área de questões
  document.getElementById('quizQuestion').style.display  = 'none';
  document.getElementById('quizOptions').style.display   = 'none';
  document.getElementById('quizCounter').style.display   = 'none';
  document.getElementById('quizFeedback').textContent    = '';
  document.getElementById('btnProxima').style.display    = 'none';
  document.getElementById('quizProgress').style.width   = '100%';

  // Exibe tela de resultado
  const resultDiv = document.getElementById('quizResult');
  resultDiv.style.display = 'block';

  // Conteúdo dinâmico baseado na pontuação
  const badge = document.getElementById('resultBadge');
  const titulo = document.getElementById('resultTitulo');
  const texto  = document.getElementById('resultTexto');
  const seal   = document.getElementById('resultSeal');
  const sealLabel = document.getElementById('sealLabel');

  document.getElementById('quizProgress').style.width = '100%';

  if (score === 5) {
    badge.style.borderColor  = 'var(--amarelo)';
    badge.style.color        = 'var(--amarelo)';
    badge.querySelector('i').className = 'fa-solid fa-trophy';
    titulo.textContent = '🏆 Especialista Verde!';
    texto.textContent  = `Incrível! Você acertou todas as ${total} perguntas!`;
    sealLabel.textContent = '🌱 Embaixador da Sustentabilidade';
    seal.style.borderColor = 'var(--amarelo)';
  } else if (score >= 3) {
    titulo.textContent = '🌿 Muito bem!';
    texto.textContent  = `Você acertou ${score} de ${total} perguntas!`;
    sealLabel.textContent = '🌿 Agro Sustentável Certificado';
  } else {
    badge.querySelector('i').className = 'fa-solid fa-seedling';
    titulo.textContent = '🌱 Continue aprendendo!';
    texto.textContent  = `Você acertou ${score} de ${total} perguntas. Tente novamente!`;
    sealLabel.textContent = '🌱 Aprendiz do Campo';
    seal.style.borderColor = 'var(--agua)';
  }
}


/* ============================================================
   11. BOTÃO VOLTAR AO TOPO
   Aparece após rolar 300px e rola suavemente para o topo ao clicar
============================================================ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  // Mostra/esconde conforme o scroll
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  // Rola ao topo suavemente
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ============================================================
   12. SCROLL SPY — Destaca o link ativo na navbar
   Observa qual seção está visível e marca o link correspondente
============================================================ */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    threshold: 0.3, // Seção precisa estar 30% visível para ser considerada ativa
    rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')} 0px 0px 0px`,
  });

  sections.forEach(sec => observer.observe(sec));
}
