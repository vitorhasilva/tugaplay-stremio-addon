function ValidationError(messageError, fields = undefined, value = undefined) {
  this.name = 'validationError';
  this.message = messageError;
  this.fields = typeof fields === 'string' ? [{ error: messageError, field: fields, value }] : fields;
}

function BlockedError(clientIp) {
  this.name = 'IpDeniedError';
  this.message = `O seu endereço IP foi bloqueado. Se acha que isto é um erro, por favor, entre em contacto com o suporte técnico e forneça o seguinte ip: ${clientIp}`;
}

module.exports = { ValidationError, BlockedError };
