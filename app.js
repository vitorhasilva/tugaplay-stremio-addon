const https = require('https')
const { addonBuilder, serveHTTP } = require('stremio-addon-sdk')
const { TugaKidsCatalog, TugaKidsStream } = require('./services/tugakids')
// const TugaFlix = require('./services/tugaflix')

const builder = new addonBuilder({
  id: `pt.tugaplay.${process.env.NODE_ENV === 'dev' ? 'developer' : 'stream'}`,
  version: '1.1.4',
  name: 'TugaPlay',
  description: 'Aceda a uma variedade de filmes e séries, reunidos de diversos serviços de terceiros. Suporte-me livremente: https://coindrop.to/vitorh_asilva',
  contactEmail: 'vitorsilva10413@gmail.com',
  logo: 'https://i.ibb.co/19byyxs/Tuga-Stream.png',
  catalogs: [{
    type: 'movie',
    id: 'tugakids',
    name: 'Adicionados Recentemente - TugaKids',
  }],
  resources: ['stream', 'catalog'],
  types: ['movie', 'series'],
  idPrefixes: ['tt']
})

let onlineUsers = 0;
let totalUsers = 0;

builder.defineStreamHandler(async function (args) {
  onlineUsers++;
  totalUsers++;
  if (onlineUsers > 1)
    console.log(`🟢 Online Users: ${onlineUsers}`)

  let existingStreams = [];
  if (args.type === 'movie') {
    existingStreams = existingStreams.concat(await TugaKidsStream(args.type, args.id))
    // existingStreams = existingStreams.concat(await TugaFlix(args.type, args.id))
    onlineUsers--;
    return Promise.resolve({
      streams: existingStreams
    })
  } else if (args.type === 'series') {
    // existingStreams = existingStreams.concat(await TugaFlix(args.type, args.id))
    onlineUsers--;
    return Promise.resolve({ streams: existingStreams })
  } else {
    onlineUsers--;
    return Promise.resolve({ streams: [] })
  }
})

builder.defineCatalogHandler(async function (args) {
  onlineUsers++;
  totalUsers++;

  if (onlineUsers > 1)
    console.log(`🟢 Online Users: ${onlineUsers}`)

  let existingCatalogs = [];
  if (args.type === 'movie') {
    existingCatalogs = existingCatalogs.concat(await TugaKidsCatalog(args.type, args.id))
    onlineUsers--;
    return Promise.resolve({ metas: existingCatalogs })
  } else {
    onlineUsers--;
    return Promise.resolve({ metas: [] })
  }
})


serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 })

setInterval(() => {
  https.get('https://tugaplay.onrender.com/manifest.json')
  totalUsers--;
  console.log(`🧮 Total Users ${totalUsers}`);
}, 1000 * 60)