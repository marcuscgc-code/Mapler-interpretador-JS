import { AnalisadorSintatico } from './sintatico.js';
import { AnalisadorLexico } from './lexico.js';
import { Interpretador } from './interpretador.js';
import { EventosService } from './eventosService.js';
import { TiposToken } from './tiposToken.js';

const eventosService = new EventosService();
const lexico = new AnalisadorLexico(eventosService);
const sintatico = new AnalisadorSintatico(eventosService);
const interpretador = new Interpretador(eventosService);

let astGlobal = null;

// Botão Interpretar
document.getElementById('interpretarBtn').addEventListener('click', () => {
  const codigo = document.getElementById('codigoPortugol').value;
  const tokens = lexico.scanTokens(codigo);
  astGlobal = sintatico.parse(tokens);

  console.log("AST gerada:", astGlobal);
  window.astGerado = astGlobal; // Disponibiliza no window para o botão Executar

  // Mostra a AST formatada
  document.getElementById('saida').textContent = JSON.stringify(astGlobal, null, 2);
});

// Botão Executar
document.getElementById('executarBtn').addEventListener('click', () => {
  const consoleDiv = document.getElementById('saidaConsole');
  consoleDiv.innerHTML = ''; // Limpa saída

  if (astGlobal) {
    interpretador.interpretar(astGlobal);
  } else {
    alert('AST não gerada! Primeiro clique em Interpretar.');
  }
});
