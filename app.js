const https = require('https')
const { addonBuilder, serveHTTP } = require('stremio-addon-sdk')
const TugaKids = require('./services/tugakids')
const TugaFlix = require('./services/tugaflix')

const builder = new addonBuilder({
  id: `pt.tugaplay.${process.env.NODE_ENV === 'dev' ? 'developer' : 'stream'}`,
  version: '1.0.0',
  name: 'TugaPlay',
  description: 'Aceda a uma variedade de filmes e séries, reunidos de diversos serviços de terceiros.',
  logo: 'https://i.ibb.co/19byyxs/Tuga-Stream.png',
  catalogs: [],
  resources: ['stream'],
  types: ['movie', 'series'],
  idPrefixes: ['tt']
})



builder.defineStreamHandler(async function (args) {
  let existingStreams = [];
  if (args.type === 'movie') {
    existingStreams = existingStreams.concat(await TugaKids(args.type, args.id))
    existingStreams = existingStreams.concat(await TugaFlix(args.type, args.id))
    return Promise.resolve({
      streams: existingStreams
    })
  } else if (args.type === 'series') {
    existingStreams = existingStreams.concat(await TugaFlix(args.type, args.id))
    return Promise.resolve({ streams: existingStreams })
  } else {
    return Promise.resolve({ streams: [] })
  }
})



serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 })

/* setInterval(() => {
  https.get('https://tugaplay.onrender.com/manifest.json')
}, 1000 * 60) */