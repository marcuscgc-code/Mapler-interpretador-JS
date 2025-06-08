export class Interpretador {
  constructor(eventosService) {
    this.eventosService = eventosService; // Para enviar mensagens de erro ou log
    this.variaveis = new Map(); // Ambiente para guardar as variáveis
  }

  interpretar(ast) {
    try {
      if (ast.tipo === "Programa") {
        for (const comando of ast.corpo) {
          this.executarDeclaracao(comando);
        }
      } else if (ast.tipo === "Modulo") {
        for (const comando of ast.corpo.declaracoes) {
          this.executarDeclaracao(comando);
        }
      } else {
        this.erro("AST inválido: tipo desconhecido");
      }
    } catch (erro) {
      this.erro(erro.message);
    }
  }

  executarDeclaracao(declaracao) {
  if (!declaracao) return;

  switch (declaracao.tipo) {
    case "VarDeclaracoes":
      for (const variavel of declaracao.variaveis) {
        this.variaveis.set(variavel.nome.lexema, null);
      }
      break;

    case "Expressao":
      this.avaliarExpressao(declaracao.expressao);
      break;

    case "Escreva":
      for (const expr of declaracao.expressoes) {
        const valor = this.avaliarExpressao(expr);
        this.exibirSaida(valor);
      }
      break;

    case "Se":
      this.executarSe(declaracao);
      break;

    case "Bloco":
      for (const cmd of declaracao.declaracoes) {
        this.executarDeclaracao(cmd);
      }
      break;
    case "Enquanto":
      this.executarEnquanto(declaracao);
    break;
    case "Para":
      this.executarPara(declaracao);
    break;
    case "Repita":
      this.executarRepita(declaracao);
     break;


    default:
      this.erro("Declaração desconhecida: " + declaracao.tipo);
  }
}
// FUNCOES DOS COMANDOS CHAMADOS DO EXECUTAR DECLARACOES
 executarSe(decl) {
  const condicao = this.avaliarExpressao(decl.condicao);
  const bloco = condicao ? decl.entao : decl.senao;

  if (bloco && bloco.declaracoes) {
    for (const cmd of bloco.declaracoes) {
      this.executarDeclaracao(cmd);
    }
  }
}
executarEnquanto(decl) {
  while (this.avaliarExpressao(decl.condicao)) {
    for (const cmd of decl.corpo.declaracoes) {
      this.executarDeclaracao(cmd);
    }
  }
}
executarPara(decl) {
  // Inicializa a variável
  this.avaliarExpressao(decl.inicial);

  while (this.avaliarExpressao(decl.condicao)) {
    for (const cmd of decl.corpo.declaracoes) {
      this.executarDeclaracao(cmd);
    }
    this.avaliarExpressao(decl.incremento); // incremento após cada ciclo
  }
}
executarRepita(decl) {
  do {
    for (const cmd of decl.corpo.declaracoes) {
      this.executarDeclaracao(cmd);
    }
  } while (!this.avaliarExpressao(decl.condicao));
}



  avaliarExpressao(expr) {
    if (!expr) return null;

    switch (expr.tipo) {
      // Caso especeficio adicionado pra ler os parenteses
      case "ExpParentizada":
        return this.avaliarExpressao(expr.grupo.expressao);
      case "Literal":
        return expr.valor;
      case "Variavel":
        return this.variaveis.get(expr.nome.lexema);
      case "Binario":
        const esquerda = this.avaliarExpressao(expr.esquerda);
        const direita = this.avaliarExpressao(expr.direita);
        return this.avaliarOperacaoBinaria(expr.operador.tipo, esquerda, direita);
      case "Atribuicao":
        const valor = this.avaliarExpressao(expr.valor);
        this.variaveis.set(expr.nome.lexema, valor);
        return valor;
      default:
        this.erro("Expressão desconhecida: " + expr.tipo);
    }
  }

  avaliarOperacaoBinaria(operadorTipo, esquerda, direita) {
    switch (operadorTipo) {
      case "MAIS": return esquerda + direita;
      case "MENOS": return esquerda - direita;
      case "ASTERISCO": return esquerda * direita;
      case "BARRA": return esquerda / direita;
      case "IGUAL": return esquerda == direita;
      case "DIFERENTE": return esquerda != direita;
      case "MAIOR_QUE": return esquerda > direita;
      case "MENOR_QUE": return esquerda < direita;
      case "MAIOR_IQUAL": return esquerda >= direita;
      case "MENOR_IGUAL": return esquerda <= direita;
      default:
        this.erro("Operador binário não implementado: " + operadorTipo);
    }
  }

  executarLeitura(atribuicao) {
    const nomeVar = atribuicao.nome.lexema;
    const entrada = prompt(`Digite o valor para ${nomeVar}:`);
    this.variaveis.set(nomeVar, entrada); // no futuro pode-se validar o tipo
  }

  executarSe(decl) {
    const condicao = this.avaliarExpressao(decl.condicao);
    const bloco = condicao ? decl.entao : decl.senao;
    if (bloco) {
      for (const cmd of bloco.declaracoes) {
        this.executarDeclaracao(cmd);
      }
    }
  }

  exibirSaida(valor) {
    if (this.eventosService) {
      this.eventosService.notificar("ESCREVER", valor);
    } else {
      console.log(valor);
    }
  }

  erro(mensagem) {
    console.error("Erro de execução:", mensagem);
    if (this.eventosService) {
      this.eventosService.notificar("ERRO", mensagem);
    }
    throw new Error(mensagem);
  }
}
