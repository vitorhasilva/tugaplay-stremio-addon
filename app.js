const { addonBuilder, serveHTTP } = require('stremio-addon-sdk')

const builder = new addonBuilder({
  id: 'pt.tugakids.addon',
  version: '0.0.1',
  name: 'TugaKids.com addon',
  catalogs: [],
  resources: ['stream'],
  types: ['movie'],
  idPrefixes: ['tt']
})

// takes function(args)
builder.defineStreamHandler(function (args) {
  if (args.type === 'movie') {
    const stream = { name: "TugaKids.com", url: `https://tkapp24.buzz/${args.id.substring(2)}.mp4`, description: "Sem qualquer direito reservado. Para uso educacional, crítica, comentário, divulgação de notícia e pesquisa, sem qualquer finalidade lucrativa direta ou conexa!" }
    console.log('%capp.js:21 object', 'color: #007acc;', stream);
    return Promise.resolve({ streams: [stream] })
  } else {
    return Promise.resolve({ streams: [] })
  }
})

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 })
//publishToCentral("https://your-domain/manifest.json") // <- invoke this if you want to publish your addon and it's accessible publically on "your-domain"