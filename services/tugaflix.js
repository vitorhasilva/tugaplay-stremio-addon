const axios = require('axios');
const cheerio = require('cheerio');
const { fetchIMDBByID: fetchIMDB } = require('./imdb');
const { normalizeStrings } = require('../utils/strings');
const SteamtapeGetDlLink = require('./steamtape');

function formatNumberInString(str) {
  // Usa uma expressão regular para encontrar todos os números na string
  return str.replace(/\d+/g, function (match) {
    // Converte a string encontrada para um número
    let num = parseInt(match, 10);
    // Verifica se o número é menor que 10
    if (num < 10) {
      // Adiciona um "0" antes do número
      return "0" + num;
    } else {
      // Mantém o número como está
      return match;
    }
  });
}

async function fetchMoviesPlayer(url) {
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

async function fetchSeriesPlayer(url, season, episode) {
  try {
    const params = new URLSearchParams();
    params.append(`S${formatNumberInString(season)}E${formatNumberInString(episode)}`, "");
    const res = await axios.post(url, params);

    const html = res.data;
    const $ = cheerio.load(html);

    const playerElement = $('iframe[name="player"]').first();
    const src = playerElement.attr('src');

    if (src) {
      return src.replace('//', 'https://');
    } else {
      console.log('Nenhum elemento com target="player" encontrado.');
    }

  } catch (error) {

  }
}

async function fetchMoviesIframeSrc(playerURl) {
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

async function fetchSeriesIframeSrc(playerURl) {
  try {
    const response = await axios.post(playerURl, new URLSearchParams({ submit: "" }));

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

async function moviesFetch(imdbId) {

  const result = [];
  const { title, year } = await fetchIMDB(imdbId);
  const normalize = normalizeStrings(title);

  const addPlayerLink = async (index) => {
    try {
      const urlPlayer = await fetchMoviesPlayer(`https://tugaflix.best/filmes/${normalize[index]}-${year}/`);
      const steamtapeUrl = await fetchMoviesIframeSrc(urlPlayer);
      const dlLink = await SteamtapeGetDlLink(steamtapeUrl);

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

  return result.length < 1 ? undefined : result;
};

async function seriesFetch(imdbId) {

  const result = [];
  const [id, season, episode] = imdbId.split(':')
  const { title } = await fetchIMDB(id);
  const normalize = normalizeStrings(title);


  const addPlayerLink = async (index) => {
    try {
      const urlPlayer = await fetchSeriesPlayer(`https://tugaflix.best/series/${normalize[index]}/`, season, episode);
      const steamtapeUrl = await fetchSeriesIframeSrc(urlPlayer);
      const dlLink = await SteamtapeGetDlLink(steamtapeUrl);

      if (dlLink) {
        result.push({
          name: index === 0 ? 'Tugaflix.best (VO)' : "Tugaflix.best (PT)",
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

  return result.length < 1 ? [] : result;
};

module.exports = async (type, id) => {
  if (type === 'movie') {
    return await moviesFetch(id);
  } else if (type === 'series') {
    return await seriesFetch(id);
  } else
    return undefined;
}