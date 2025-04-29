import { AnalisadorLexico } from './lexico.js';
import { AnalisadorSintatico } from './sintatico.js';
import { EventosService } from './eventosService.js';
import { Interpretador } from './interpretador.js';

const eventosService = new EventosService((tipo, mensagem) => {
  if (tipo === "ESCREVER") {
    const consoleDiv = document.getElementById('saidaConsole');
    consoleDiv.innerHTML += mensagem + "<br>";
  } else if (tipo === "ERRO") {
    alert("Erro: " + mensagem);
  }
});

const lexico = new AnalisadorLexico(eventosService);
const sintatico = new AnalisadorSintatico(eventosService);
const interpretador = new Interpretador(eventosService);

window.interpretar = function interpretar() {
  const editor = document.getElementById('codigoPortugol');
  const saida = document.getElementById('saida');
  saida.textContent = '';

  try {
    const tokens = lexico.scanTokens(editor.value);
    const ast = sintatico.parse(tokens);
    console.log("AST:", ast);

    window.astGerado = ast; // salvar AST para botão executar
    saida.textContent = JSON.stringify(ast, null, 2);
  } catch (e) {
    saida.textContent = `Erro inesperado: ${e.message}`;
  }
};

document.getElementById('interpretarBtn').addEventListener('click', () => {
  window.interpretar();
});

document.getElementById('executarBtn').addEventListener('click', () => {
  if (!window.astGerado) {
    alert('AST não gerada! Primeiro clique em Interpretar.');
    return;
  }

  document.getElementById('saidaConsole').innerHTML = '';
  interpretador.interpretar(window.astGerado);
});
