export class Interpretador {
    constructor(eventosService) {
      this.eventosService = eventosService; // Para enviar mensagens de erro ou log
      this.variaveis = new Map(); // Ambiente para guardar as variáveis
    }
  
    interpretar(ast) {
      try {
        if (ast.tipo === "Programa") {
          // Interpreta as variáveis
          for (const declaracao of ast.variaveis) {
            this.executarDeclaracao(declaracao);
          }
          // Interpreta o corpo do programa
          for (const comando of ast.corpo) {
            this.executarDeclaracao(comando);
          }
        } else if (ast.tipo === "Modulo") {
          // Se futuramente quiser executar módulos diretos
          this.executarDeclaracao(ast.corpo);
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
    
        case "Ler":
          this.executarLeitura(declaracao.atribuicao);
          break;
    
        case "Se":
          this.executarSe(declaracao);
          break;
    
        case "Bloco":   // <=== ADICIONE ISSO AQUI
          for (const cmd of declaracao.declaracoes) {
            this.executarDeclaracao(cmd);
          }
          break;
    
        default:
          this.erro("Declaração desconhecida: " + declaracao.tipo);
      }
    }
    
  
    avaliarExpressao(expr) {
      if (!expr) return null;
  
      switch (expr.tipo) {
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
      // No futuro, pode validar o tipo aqui
      this.variaveis.set(nomeVar, entrada);
    }
  
    executarSe(decl) {
      const condicao = this.avaliarExpressao(decl.condicao);
      if (condicao) {
        for (const cmd of decl.entao.declaracoes) {
          this.executarDeclaracao(cmd);
        }
      } else if (decl.senao) {
        for (const cmd of decl.senao.declaracoes) {
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
  

//   Busca executar declarações de variaveis , escrita, comandos de leitura, atribuições, expressoes biárias, estruturas de decisao
//  e reportagem de erros