const https = require('https')
const { addonBuilder, serveHTTP } = require('stremio-addon-sdk')
const { TugaKidsCatalog, TugaKidsStream } = require('./services/tugakids')
const { OTFTStream } = require('./services/osteusfilmestuga')
// const TugaFlix = require('./services/tugaflix')

const builder = new addonBuilder({
  id: `pt.tugaplay.${process.env.NODE_ENV === 'development' ? 'development' : 'premium'}`,
  version: '1.3.3',
  name: 'TugaPlay Premium',
  description: 'Aceda a uma variedade de filmes e séries, reunidos de diversos serviços de terceiros. Esta é uma versão Premium!',
  logo: 'https://i.ibb.co/JjFByHZ/Tuga-Stream-1.png',
  catalogs: [{
    type: 'movie',
    id: 'tugakids',
    name: 'TugaKids',
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
  if (onlineUsers > 5)
    console.log(`🟢 Online Users: ${onlineUsers}`)

  let existingStreams = [];
  if (args.type === 'movie') {
    existingStreams = existingStreams.concat(await TugaKidsStream(args.type, args.id))
    existingStreams = existingStreams.concat(await OTFTStream(args.type, args.id))
    // existingStreams = existingStreams.concat(await TugaFlix(args.type, args.id))
    onlineUsers--;
    return Promise.resolve({
      streams: existingStreams
    })
  } else if (args.type === 'series') {
    existingStreams = existingStreams.concat(await OTFTStream(args.type, args.id))
    // existingStreams = existingStreams.concat(await TugaFlix(args.type, args.id))
    onlineUsers--;
    return Promise.resolve({ streams: existingStreams })
  } else {
    onlineUsers--;
    return Promise.resolve({ streams: [] })
  }
})

builder.defineCatalogHandler(async function (args) {

  let existingCatalogs = [];
  if (args.type === 'movie') {
    existingCatalogs = existingCatalogs.concat(await TugaKidsCatalog(args.type, args.id))
    return Promise.resolve({ metas: existingCatalogs })
  } else {
    return Promise.resolve({ metas: [] })
  }

})


serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 })

setInterval(() => {
  https.get('https://tugaplay-addon.onrender.com/manifest.json')
  // console.log(`🧮 Total Users ${totalUsers}`);
}, 1000 * 60)