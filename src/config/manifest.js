const packageJson = require('../../package.json');

module.exports = {
  id: `pt.tugaplay.${process.env.NODE_ENV === 'online' ? 'online' : 'local'}`,
  version: packageJson.version,
  name: `TugaPlay${process.env.NODE_ENV === 'local' ? ' - Local' : ''}`,
  description: packageJson.description,
  logo: 'https://i.ibb.co/N2W22fN/Tugaplay-logo.png',
  background: 'https://www.biancogres.com.br/wp-content/uploads/2019/10/cinema-em-casa-1024x575.jpg',
  contactEmail: packageJson.author.email,
  catalogs: [{
    type: 'movie',
    id: 'tugakids',
    name: 'TugaKids',
  }],
  resources: ['stream', 'catalog', 'subtitles'],
  types: ['movie', 'series'],
  idPrefixes: ['tt'],
  behaviorHints: {
    configurable: true,
  },
};
