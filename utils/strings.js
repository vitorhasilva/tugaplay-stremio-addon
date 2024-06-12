function normalizeStrings(strings) {
  return strings.map(str => {
    // Remover acentos
    const withoutAccents = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const withoutSpaces = withoutAccents.replace(/\s+/g, '-').toLowerCase();

    return withoutSpaces.replace(':', '')
  });
}
module.exports = {
  normalizeStrings
}