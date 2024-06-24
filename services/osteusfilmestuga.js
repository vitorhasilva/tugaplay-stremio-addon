const axios = require('axios');
const cheerio = require('cheerio');
const knex = require('knex');
const { fetchIMDBByID } = require('./imdb');
const { normalizeStrings } = require('../utils/strings');
const knexFile = require('../knexfile');

const db = knex(knexFile[process.env.NODE_ENV]);


async function fetchPlayer(title, year = undefined) {
  try {
    const res = await axios.get(`https://osteusfilmestuga.online/wp-json/dooplay/search/?keyword=${title}&nonce=55ec828814`);

    const data = res.data;
    let matched;
    for (const postId in data) {
      if (data.hasOwnProperty(postId)) {
        const dt = data[postId];
        if (postId === 'error') {
          return undefined
        } else if (!year || dt.extra.date === year.toString()) {
          matched = { postId, url: dt.url };
          break;
        }
      }
    }

    return matched || undefined;

  } catch (error) {

  }
}

async function fetchPlayerSeries(url) {

  try {
    const res = await axios.get(url);


    const html = res.data;
    const $ = cheerio.load(html);

    const shortlink = $("link[rel='shortlink']").attr('href');

    if (shortlink) {
      const urlObj = new URL(shortlink);
      const pValue = urlObj.searchParams.get('p');
      return pValue
    } else {
      console.log('Nenhum elemento com target="shortlink" encontrado.');
    }

  } catch (error) {
  }
}

async function fetchWpAdmin(post, nume, type) {
  try {
    const res = await axios.post('https://osteusfilmestuga.online/wp-admin/admin-ajax.php', new URLSearchParams({
      action: 'doo_player_ajax',
      post: post,
      nume: nume,
      type: type
    }));

    const embedUrl = res.data.embed_url;

    if (embedUrl !== "") {
      const srcWish = embedUrl.match(/SRC="([^"]+)"/i)[1];

      return srcWish.replace('cdnwish.com', 'asnwish.com');
    } else {
      return undefined;
    }


  } catch (error) {
  }
}

async function fetchM3u8Src(playerURl) {
  try {
    const response = await axios.get(playerURl);

    if (response.status === 200) {
      const html = response.data;
      const regex = /sources:\s*\[\s*\{file:"([^"]+)"/;
      const match = html.match(regex);

      if (match) {
        const videoUrl = match[1];
        return videoUrl;
      }
    }
  } catch (error) {

  }
}

async function moviesFetch(imdbId) {
  const result = await db('osteusfilmestuga').where({ imdbId }).first();
  let urlsAsnwish = { srcWishA: undefined, srcWishB: undefined };
  const currentDate = new Date();

  if (result) {
    if (result.srcWishA !== null || result.srcWishB !== null) {
      if (result.srcWishA !== null && result.srcWishB === "") {
        urlsAsnwish = await updateUrlsMovies(imdbId);
        await db('osteusfilmestuga').update({
          srcWishA: urlsAsnwish.srcWishA ? urlsAsnwish.srcWishA : null,
          srcWishB: urlsAsnwish.srcWishB ? urlsAsnwish.srcWishB : null,
          updatedAt: currentDate
        }).where({ imdbId });
      } else {
        urlsAsnwish.srcWishA = result.srcWishA;
        urlsAsnwish.srcWishB = result.srcWishB;
      }
    } else {
      const updatedAt = new Date(result.updatedAt);

      const differenceInDays = (currentDate - updatedAt) / (1000 * 60 * 60 * 24);

      if (differenceInDays > 3) {
        urlsAsnwish = await updateUrlsMovies(imdbId);
        await db('osteusfilmestuga').update({
          srcWishA: urlsAsnwish.srcWishA ? urlsAsnwish.srcWishA : null,
          srcWishB: urlsAsnwish.srcWishB ? urlsAsnwish.srcWishB : null,
          updatedAt: currentDate
        }).where({ imdbId });
      }
    }

  } else {
    urlsAsnwish = await updateUrlsMovies(imdbId);
    await db('osteusfilmestuga').insert({
      imdbId,
      srcWishA: urlsAsnwish.srcWishA ? urlsAsnwish.srcWishA : null,
      srcWishB: urlsAsnwish.srcWishB ? urlsAsnwish.srcWishB : null,
    });
  }

  const urlsToFetch = Object.values(urlsAsnwish).filter(url => url !== undefined);

  if (urlsToFetch.length > 0) {
    const m3u8Promises = urlsToFetch.map(async (urlAsnwish, idx) => {
      const m3u8 = await fetchM3u8Src(urlAsnwish);
      return {
        name: 'Os Teus Filmes Tuga',
        url: m3u8,
        description: `🌍 Áudio em Português (PT-PT)\n🌐 Fonte: https://osteusfilmestuga.online${idx === 1 ? '\n🎞️ Alternativo' : ''}`
      };
    });
    return await Promise.all(m3u8Promises);
  } else {
    return []
  }


};

async function seriesFetch(imdbId) {
  const result = await db('osteusfilmestuga').where({ imdbId }).first();
  let urlsAsnwish = { srcWishA: undefined, srcWishB: undefined };
  const currentDate = new Date();

  if (result) {
    if (result.srcWishA !== null || result.srcWishB !== null) {
      if (result.srcWishA !== null && result.srcWishB === "") {

        urlsAsnwish = await updateUrlsSeries(imdbId);
        await db('osteusfilmestuga').update({
          srcWishA: urlsAsnwish.srcWishA ? urlsAsnwish.srcWishA : null,
          srcWishB: urlsAsnwish.srcWishB ? urlsAsnwish.srcWishB : null,
          updatedAt: currentDate
        }).where({ imdbId });
      } else {
        urlsAsnwish.srcWishA = result.srcWishA;
        urlsAsnwish.srcWishB = result.srcWishB;
      }
    } else {
      const updatedAt = new Date(result.updatedAt);

      const differenceInDays = (currentDate - updatedAt) / (1000 * 60 * 60 * 24);

      if (differenceInDays > 3) {
        urlsAsnwish = await updateUrlsSeries(imdbId);
        await db('osteusfilmestuga').update({
          srcWishA: urlsAsnwish.srcWishA ? urlsAsnwish.srcWishA : null,
          srcWishB: urlsAsnwish.srcWishB ? urlsAsnwish.srcWishB : null,
          updatedAt: currentDate
        }).where({ imdbId });
      }
    }
  } else {
    urlsAsnwish = await updateUrlsSeries(imdbId);
    await db('osteusfilmestuga').insert({
      imdbId,
      srcWishA: urlsAsnwish.srcWishA ? urlsAsnwish.srcWishA : null,
      srcWishB: urlsAsnwish.srcWishB ? urlsAsnwish.srcWishB : null,
    });
  }

  const urlsToFetch = Object.values(urlsAsnwish).filter(url => url !== undefined);

  if (urlsToFetch.length > 0) {
    const m3u8Promises = urlsToFetch.map(async (urlAsnwish, idx) => {
      const m3u8 = await fetchM3u8Src(urlAsnwish);
      return {
        name: 'Os Teus Filmes Tuga',
        url: m3u8,
        description: `🌍 Áudio em Português (PT-PT)\n🌐 Fonte: https://osteusfilmestuga.online${idx === 1 ? '\n🎞️ Alternativo' : ''}`
      };
    });

    return await Promise.all(m3u8Promises);
  } else {
    return [];
  }
}

async function updateUrlsMovies(imdbId) {
  let urlsAsnwish;
  let postId;

  const { title, year } = await fetchIMDBByID(imdbId);

  postId = await fetchPlayer(title[0], year);

  if (postId) {
    urlsAsnwish = {
      srcWishA: await fetchWpAdmin(postId.postId, 2, 'movie'),
      srcWishB: await fetchWpAdmin(postId.postId, 1, 'movie')
    };
  } else {
    postId = await fetchPlayer(title[0], year);
    if (postId) {
      urlsAsnwish = {
        srcWishA: await fetchWpAdmin(postId.postId, 2, 'movie'),
        srcWishB: await fetchWpAdmin(postId.postId, 1, 'movie')
      };
    }
    urlsAsnwish = {
      srcWishA: undefined,
      srcWishB: undefined
    };
  }
  return urlsAsnwish;
}

async function updateUrlsSeries(imdbId) {
  let urlsAsnwish;
  const [id, season, episode] = imdbId.split(':');
  const { title } = await fetchIMDBByID(id);

  let postId = await searchForPostId(title, season, episode)

  if (postId) {
    urlsAsnwish = {
      srcWishA: await fetchWpAdmin(postId, 2, 'tv'),
      srcWishB: await fetchWpAdmin(postId, 1, 'tv')
    };
  } else {
    urlsAsnwish = {
      srcWishA: undefined,
      srcWishB: undefined
    };
  }

  return urlsAsnwish;
}

async function searchForPostId(title, season, episode) {
  let postId;
  const normalize = normalizeStrings(title);

  let postIdExist = await fetchPlayer(title[0]);

  if (postIdExist) {
    postId = await fetchPlayerSeries(`https://osteusfilmestuga.online/episodios/${normalize[0]}-${season}-x-${episode}/`);
    if (!postId && postIdExist.url) {
      postId = await fetchPlayerSeries(`https://osteusfilmestuga.online/episodios/${postIdExist.url.split('/')[4]}-${season}-x-${episode}/`);
    }
  } else if (title.length > 1) {
    postIdExist = await fetchPlayer(title[1]);
    if (postIdExist) {
      postId = await fetchPlayerSeries(`https://osteusfilmestuga.online/episodios/${normalize[1]}-${season}-x-${episode}/`);
      if (!postId && postIdExist.url) {
        postId = await fetchPlayerSeries(`https://osteusfilmestuga.online/episodios/${postIdExist.url.split('/')[4]}-${season}-x-${episode}/`);
      }
    }
  }

  return postId;
}


async function OTFTStream(type, id) {
  if (type === 'movie') {
    return await moviesFetch(id);
  } else if (type === 'series') {
    return await seriesFetch(id);
  } else
    return undefined;
}

module.exports = {
  OTFTStream,
}