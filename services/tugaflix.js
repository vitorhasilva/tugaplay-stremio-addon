const axios = require('axios');
const cheerio = require('cheerio');
const fetchIMDB = require('./imdb');
const SteamtapeGetDlLink = require('./steamtape');

async function fetchPlayer(url) {
  try {
    const res = await axios.post(url, new URLSearchParams({ play: '' }));

    const html = res.data;
    const $ = cheerio.load(html);

    const playerElement = $('a[target="player"]').first();
    const href = playerElement.attr('href');

    if (href) {
      return href.replace('//', 'https://');
    } else {
      console.log('Nenhum elemento com target="player" encontrado.');
    }

  } catch (error) {

  }
}

async function fetchIframeSrc(playerURl) {
  try {
    const response = await axios.get(playerURl);

    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);

      // Encontrar o primeiro elemento iframe e obter o src
      const iframeElement = $('iframe').first();
      const src = iframeElement.attr('src');
      const srcParts = src.split('?');
      if (src) {
        return srcParts[0];
      } else {
        console.log('Nenhum elemento iframe encontrado.');
      }
    } else {
      console.error('Erro ao obter a página:', response.status, response.statusText);
    }
  } catch (error) {

  }
}

function normalizeStrings(strings) {
  return strings.map(str => {
    // Remover acentos
    const withoutAccents = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Trocar espaços por traços e colocar tudo em minúsculas
    return withoutAccents.replace(/\s+/g, '-').toLowerCase();
  });
}

async function movieFetch(id) {

  const result = [];
  const { title, year } = await fetchIMDB(id);
  const normalize = normalizeStrings(title);
  console.log('%cservices\tugaflix.js:67 normalize', 'color: #007acc;', normalize);
  const addPlayerLink = async (index) => {
    try {
      const urlPlayer = await fetchPlayer(`https://tugaflix.best/filmes/${normalize[index]}-${year}/`);
      console.log('%cservices\tugaflix.js:71 urlPlayer', 'color: #007acc;', urlPlayer);
      const steamtapeUrl = await fetchIframeSrc(urlPlayer);
      console.log('%cservices\tugaflix.js:73 steamtapeUrl', 'color: #007acc;', steamtapeUrl);
      const dlLink = await SteamtapeGetDlLink(steamtapeUrl);
      console.log('%cservices\tugaflix.js:75 dlLink', 'color: #007acc;', dlLink);
      if (dlLink) {
        result.push({
          name: index === 0 ? 'Tugaflix.best (VO)' : "Tugaflix.best (VP)",
          url: dlLink,
          description: index === 0 ? "Audio Original (VO)" : "Audio em Portugues (PT-PT)"
        });
      }
    } catch (error) {

    }
  };


  await addPlayerLink(0);

  if (normalize.length > 1) {
    await addPlayerLink(1);
  }
  console.log('%cservices\tugaflix.js:94 ', 'color: #007acc;', result.length < 1 ? undefined : result);
  return result.length < 1 ? undefined : result;
};

module.exports = async (type, id) => {
  if (type === 'movie') {
    return await movieFetch(id);
  } else if (type === 'serie') {
    return undefined;
  } else
    return undefined;
}