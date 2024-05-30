const { addonBuilder, serveHTTP } = require('stremio-addon-sdk')
const TugaKids = require('./services/tugakids')
const builder = new addonBuilder({
  id: 'pt.tugaplay.stream',
  version: '1.0.0',
  name: 'TugaPlay',
  description: 'Aceda a uma variedade de filmes e séries, reunidos de diversos serviços de terceiros.',
  logo: 'https://i.ibb.co/19byyxs/Tuga-Stream.png',
  catalogs: [],
  resources: ['stream'],
  types: ['movie'],
  idPrefixes: ['tt']
})



builder.defineStreamHandler(async function (args) {
  if (args.type === 'movie') {
    return Promise.resolve({ streams: [await TugaKids(args.type, args.id)] })
  } else {
    return Promise.resolve({ streams: [] })
  }
})

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 })
//publishToCentral("https://your-domain/manifest.json") // <- invoke this if you want to publish your addon and it's accessible publically on "your-domain"