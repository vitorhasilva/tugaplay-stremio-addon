const axios = require('axios')
const cheerio = require('cheerio');

async function checkExists(id) {
  try {
    const response = await axios.head(`https://tkapp24.buzz/${id.substring(2)}.mp4`);
    return !(response.headers['content-disposition'] && response.headers['content-disposition'].includes('attachment'))
  } catch (error) {
    return false
  }
};

const TugaKidsStream = async (type, id) => {
  if (type === 'movie') {
    const exists = await checkExists(id)
    if (exists) {
      return [{
        name: "TugaKids.com",
        url: `https://tkapp24.buzz/${id.substring(2)}.mp4`,
        description: "Audio em Portugues (PT-PT)"
      }]
    }
    else return undefined;
  } else if (type === 'serie') {
    return [];
  } else
    return [];

}

async function fetchTugaKids() {
  let page = 1;
  const titles = [];
  try {
    while (true) {
      const res = await axios.post(`https://www.tugakids.com/${page !== 1 ? `page/${page}/` : ''}`);
      if (res.status === 200) {
        const html = res.data;
        const $ = cheerio.load(html);
        $('.items .post li').each((index, element) => {
          const title = $(element).find('h2').text().trim();
          const imageSrc = $(element).find('img').attr('src');
          const imdbID = 'tt' + imageSrc.split('/')[7].split('.')[0]
          titles.push({
            id: imdbID,
            name: title,
            type: 'movie',
            poster: imageSrc,
            posterShape: 'poster'
          });
        });
        page += 1;
      }
    }
  } catch (error) {
    return titles;
  }
}

const TugaKidsCatalog = async (type, id) => {
  if (type === 'movie' && id === 'tugakids') {
    return await fetchTugaKids();
  } else {
    return []
  }
}

module.exports = {
  TugaKidsStream,
  TugaKidsCatalog
}