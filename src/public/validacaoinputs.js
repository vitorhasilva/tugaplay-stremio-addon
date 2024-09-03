/* eslint-disable no-restricted-syntax */
/**
 * Classe para validação de inputs no DOM.
 */
class ValidacaoInputs {
  /**
   * Cria uma instância da classe ValidacaoInputs.
   * @param {Object} errorStyle - Estilo a ser aplicado quando um input tem erro.
   * @param {...(string|string[])} args - IDs dos inputs a serem adicionados.
   */
  constructor(errorStyle, ...args) {
    this.inputs = {};
    this.errorStyle = errorStyle;
    this.addInputs(...args);
  }

  addInputs(...args) {
    args.forEach((input) => {
      if (Array.isArray(input)) {
        input.forEach((item) => {
          const element = document.getElementById(item);
          if (element) {
            this.inputs[item] = { element, inError: false };
          } else {
            console.error(`Erro: O input com ID '${item}' não foi encontrado no DOM.`);
          }
        });
      } else {
        const element = document.getElementById(input);
        if (element) {
          this.inputs[input] = { element, inError: false };
        } else {
          console.error(`Erro: O input com ID '${input}' não foi encontrado no DOM.`);
        }
      }
    });
  }

  addError(inputId, textError) {
    if (Object.prototype.hasOwnProperty.call(this.inputs, inputId)) {
      if (textError) {
        const { element } = this.inputs[inputId];
        this.inputs[inputId] = {
          element,
          inError: true,
          msgError: textError,
        };
        Object.assign(element.style, this.errorStyle);
        element.setAttribute('data-error-message', textError);
      } else {
        console.error('Erro: A mensagem de erro não pode estar vazia.');
      }
    } else {
      console.error(`Erro: O input '${inputId}' não existe.`);
    }
  }

  removeError(inputId) {
    if (Object.prototype.hasOwnProperty.call(this.inputs, inputId)) {
      const { element } = this.inputs[inputId];
      this.inputs[inputId] = {
        element,
        inError: false,
        msgError: undefined,
      };
      Object.keys(this.errorStyle).forEach((key) => {
        element.style[key] = '';
      });
      element.removeAttribute('data-error-message');
    } else {
      console.error(`Erro: O input '${inputId}' não existe.`);
    }
  }

  isError(inputId) {
    if (Object.prototype.hasOwnProperty.call(this.inputs, inputId)) {
      return this.inputs[inputId]?.inError === true;
    }
    console.error(`Erro: O input '${inputId}' não existe.`);
    return false;
  }

  getErrorStyle(inputId) {
    if (Object.prototype.hasOwnProperty.call(this.inputs, inputId)) {
      return this.isError(inputId) ? this.errorStyle : {};
    }
    console.error(`Erro: O input '${inputId}' não existe.`);
    return {};
  }

  isAnyError(...args) {
    return args.some((input) => this.isError(input));
  }

  resetAllErrors() {
    for (const inputId in this.inputs) {
      if (Object.prototype.hasOwnProperty.call(this.inputs, inputId)) {
        this.removeError(inputId);
      }
    }
  }

  getErrorMessage(inputId) {
    if (this.isError(inputId)) {
      return this.inputs[inputId]?.msgError || '';
    }
    console.error(`Erro: O input '${inputId}' não se encontra em erro.`);
    return '';
  }
}

// Torna a classe disponível globalmente
window.ValidacaoInputs = ValidacaoInputs;
