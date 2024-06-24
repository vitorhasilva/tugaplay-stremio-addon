const axios = require('axios')
const cheerio = require('cheerio');
const knex = require('knex');
const cron = require('node-cron');
const { sendEmailWithNewMovies } = require('../utils/mailer');
const knexFile = require('../knexfile');


const db = knex(knexFile[process.env.NODE_ENV]);

async function checkExists(id) {
  try {
    const response = await axios.head(`https://tkapp24.buzz/${id.substring(2)}.mp4`);
    const contentDisposition = !(response.headers['content-disposition'] && response.headers['content-disposition'].includes('attachment'))

    if (contentDisposition) {
      const contentType = !(response.headers['content-type'] && response.headers['content-type'] === 'text/html; charset=utf-8');
      const contentLength = !(response.headers['content-length'] && parseInt(response.headers['content-length']) === 0);

      return contentType && contentLength
    } else return false

  } catch (error) {
    return false
  }
};

const TugaKidsStream = async (type, id) => {
  if (type === 'movie') {
    const exists = await checkExists(id)

    if (exists) {
      return [{
        name: "TugaKids",
        url: `https://tkapp24.buzz/${id.substring(2)}.mp4`,
        description: "🌍 Audio em Portugues (PT-PT)\n🌐 Fonte: https://www.tugakids.com"
      }]
    }
    else return [];
  } else if (type === 'serie') {
    return [];
  } else
    return [];

}

cron.schedule('0 0 * * *', async () => {
  let page = 1;
  const titles = [];
  try {
    // Obter todos os IDs existentes da base de dados de uma vez
    const existingIds = await db('catalogo_tugakids').pluck('id');

    while (true) {
      const res = await axios.post(`https://www.tugakids.com/${page !== 1 ? `page/${page}/` : ''}`);
      if (res.status === 200) {
        const html = res.data;
        const $ = cheerio.load(html);
        const items = $('.items .post li');

        for (let i = 0; i < items.length; i++) {
          const element = items[i];
          const title = $(element).find('h2').text().trim();
          const imageSrc = $(element).find('img').attr('src');
          const imdbID = 'tt' + imageSrc.split('/')[7].split('.')[0];

          // Verificar se o ID já existe na lista obtida
          if (!existingIds.includes(imdbID)) {
            titles.push({
              id: imdbID,
              name: title,
              type: 'movie',
              poster: imageSrc,
              posterShape: 'poster'
            });
          }
        }

        page += 1;
      }
    }
  } catch (error) {
    if (titles.length > 0) {
      await db('catalogo_tugakids').insert(titles.slice().reverse());
      sendEmailWithNewMovies(titles);
    }
  }
}, {
  scheduled: true,
  timezone: 'Europe/Lisbon'
});



const TugaKidsCatalog = async (type, id) => {
  if (type === 'movie' && id === 'tugakids') {
    return (await db('catalogo_tugakids').select(["id", "name", "type", "poster", "posterShape"]).orderBy('order', 'desc'));
  } else {
    return []
  }
}

module.exports = {
  TugaKidsStream,
  TugaKidsCatalog
}