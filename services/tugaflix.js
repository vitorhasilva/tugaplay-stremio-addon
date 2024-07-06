const axios = require('axios');
const cheerio = require('cheerio');
const knex = require('knex');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const { fetchIMDBByID: fetchIMDB } = require('./imdb');
const { normalizeStrings } = require('../utils/strings');
const SteamtapeGetDlLink = require('./steamtape');
const knexFile = require('../knexfile');

const db = knex(knexFile[process.env.NODE_ENV]);

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
      const parsedUrl = new url.URL(src);
      const subtitlesUrl = parsedUrl.searchParams.get('c1_file');
      if (src) {
        return {
          player: src.replace(/\n/g, ''),
          sub: subtitlesUrl || null
        };
      } else {
        return {
          player: undefined,
          sub: subtitlesUrl || null
        };
      }
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
      const parsedUrl = new url.URL(src);
      const subtitlesUrl = parsedUrl.searchParams.get('c1_file');

      if (src) {
        return {
          player: src.replace(/\n/g, ''),
          sub: subtitlesUrl || null
        };
      } else {
        return {
          player: undefined,
          sub: subtitlesUrl || null
        };
      }
    }
  } catch (error) {

  }
}

async function moviesFetch(imdbId) {
  const result = await db('tugaflix').where({ imdbId }).first();
  let urlsSteamtape = { srcA: undefined, srcB: undefined, subtitle: undefined };
  const currentDate = new Date();

  if (result) {
    if (result.srcA !== null || result.srcB !== null) {
      urlsSteamtape.srcA = result.srcA;
      urlsSteamtape.srcB = result.srcB;
      urlsSteamtape.subtitle = undefined;
    } else {
      const updatedAt = new Date(result.updatedAt);

      const differenceInDays = (currentDate - updatedAt) / (1000 * 60 * 60 * 24);

      if (differenceInDays > 3) {
        urlsSteamtape = await updateUrlsMovies(imdbId);
        await db('tugaflix').update({
          srcA: urlsSteamtape.srcA ? urlsSteamtape.srcA : null,
          srcB: urlsSteamtape.srcB ? urlsSteamtape.srcB : null,
          subtitle: urlsSteamtape.subtitle ? urlsSteamtape.subtitle : null,
          updatedAt: currentDate
        }).where({ imdbId });
      }
    }
  } else {
    urlsSteamtape = await updateUrlsMovies(imdbId);
    await db('tugaflix').insert({
      imdbId,
      srcA: urlsSteamtape.srcA ? urlsSteamtape.srcA : null,
      srcB: urlsSteamtape.srcB ? urlsSteamtape.srcB : null,
      subtitle: urlsSteamtape.subtitle ? urlsSteamtape.subtitle : null,
    });
  }

  const urlsToFetch = Object.values(urlsSteamtape).filter(url => url !== undefined);

  if (urlsToFetch.length > 0) {
    const m3u8Promises = urlsToFetch.map(async (urlSteamtape, idx) => {
      // const m3u8 = await SteamtapeGetDlLink(urlSteamtape);
      if (urlSteamtape !== null) {
        const parsedUrl = new url.URL(urlSteamtape);
        if (parsedUrl.hostname !== 'tugaflix.org')
          return {
            name: idx === 0 ? 'Tugaflix.best (VO)' : "Tugaflix.best (VP)",
            externalUrl: urlSteamtape,
            description: idx === 0 ? "🌍 Audio Original (VO)\n🌐 Fonte: https://tugaflix.best\n🔗 URL Externo" : "🌍 Audio em Portugues (PT-PT)\n🌐 Fonte: https://tugaflix.best\n🔗 URL Externo"
          };
      };
    });
    return await Promise.all(m3u8Promises);
  } else {
    return []
  }

};

async function seriesFetch(imdbId) {
  const result = await db('tugaflix').where({ imdbId }).first();
  let urlsSteamtape = { srcA: undefined, srcB: undefined, subtitle: undefined };
  const currentDate = new Date();

  if (result) {
    if (result.srcA !== null || result.srcB !== null) {
      urlsSteamtape.srcA = result.srcA;
      urlsSteamtape.srcB = result.srcB;
      urlsSteamtape.subtitle = undefined;
    } else {
      const updatedAt = new Date(result.updatedAt);

      const differenceInDays = (currentDate - updatedAt) / (1000 * 60 * 60 * 24);

      if (differenceInDays > 3) {
        urlsSteamtape = await updateUrlsSeries(imdbId);
        await db('tugaflix').update({
          srcA: urlsSteamtape.srcA ? urlsSteamtape.srcA : null,
          srcB: urlsSteamtape.srcB ? urlsSteamtape.srcB : null,
          subtitle: urlsSteamtape.subtitle ? urlsSteamtape.subtitle : null,
          updatedAt: currentDate
        }).where({ imdbId });
      }
    }
  } else {
    urlsSteamtape = await updateUrlsSeries(imdbId);
    await db('tugaflix').insert({
      imdbId,
      srcA: urlsSteamtape.srcA ? urlsSteamtape.srcA : null,
      srcB: urlsSteamtape.srcB ? urlsSteamtape.srcB : null,
      subtitle: urlsSteamtape.subtitle ? urlsSteamtape.subtitle : null,
    });
  }

  const urlsToFetch = Object.values(urlsSteamtape).filter(url => url !== undefined);

  if (urlsToFetch.length > 0) {
    const m3u8Promises = urlsToFetch.map(async (urlSteamtape, idx) => {
      // const m3u8 = await SteamtapeGetDlLink(urlSteamtape);
      if (urlSteamtape !== null) {
        const parsedUrl = new url.URL(urlSteamtape);
        if (parsedUrl.hostname !== 'tugaflix.org')
          return {
            name: idx === 0 ? 'Tugaflix.best (VO)' : "Tugaflix.best (VP)",
            externalUrl: urlSteamtape,
            description: idx === 0 ? "🌍 Audio Original (VO)\n🌐 Fonte: https://tugaflix.best\n🔗 URL Externo" : "🌍 Audio em Portugues (PT-PT)\n🌐 Fonte: https://tugaflix.best\n🔗 URL Externo"
          };
      }

    });
    return await Promise.all(m3u8Promises);
  } else {
    return []
  }
};

async function updateUrlsMovies(imdbId) {
  let urlsSteamtape;
  const { title, year } = await fetchIMDB(imdbId);
  const normalize = normalizeStrings(title);

  const PlayerLink = async (index) => {
    const urlPlayer = await fetchMoviesPlayer(`https://tugaflix.best/filmes/${normalize[index]}-${year}/`);
    const urlSteamtape = await fetchMoviesIframeSrc(urlPlayer);
    return urlSteamtape;
  }

  const srcOV = await PlayerLink(0);
  const srcVP = await PlayerLink(1);

  urlsSteamtape = {
    srcA: srcOV ? srcOV.player : undefined,
    srcB: srcVP ? srcVP.player : undefined,
    subtitle: srcOV ? srcOV.sub : undefined,
  };

  return urlsSteamtape;
}

async function updateUrlsSeries(imdbId) {
  let urlsSteamtape;
  const [id, season, episode] = imdbId.split(':')
  const { title, year } = await fetchIMDB(id);
  const normalize = normalizeStrings(title);

  const PlayerLink = async (index) => {
    const urlPlayer = await fetchSeriesPlayer(`https://tugaflix.best/series/${normalize[index]}/`, season, episode);
    const urlSteamtape = await fetchSeriesIframeSrc(urlPlayer);
    return urlSteamtape;
  }

  const srcOV = await PlayerLink(0);
  const srcVP = await PlayerLink(1);

  urlsSteamtape = {
    srcA: srcOV ? srcOV.player : undefined,
    srcB: srcVP ? srcVP.player : undefined,
    subtitle: srcOV ? srcOV.sub : undefined,
  };

  return urlsSteamtape;
}

const TugaFlixStream = async (type, id) => {
  if (type === 'movie') {
    return await moviesFetch(id);
  } else if (type === 'series') {
    return await seriesFetch(id);
  } else
    return undefined;
}

const TugaFlixSubtitle = async (type, id) => {
  const result = await db('tugaflix').where({ imdbId: id }).first('subtitle');
  if (result) {
    return [
      {
        id: uuidv4(),
        url: result.subtitle,
        lang: 'por'
      }
    ]
  } else {
    return [];
  }

}

module.exports = {
  TugaFlixStream,
  TugaFlixSubtitle
}