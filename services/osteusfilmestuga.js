const axios = require('axios');
const cheerio = require('cheerio');
const knex = require('knex');
const { fetchIMDBByID } = require('./imdb');
const { normalizeStrings } = require('../utils/strings');
const knexFile = require('../knexfile');

const db = knex(knexFile[process.env.NODE_ENV]);


async function fetchPlayer(url) {
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
      } else {
        console.log('URL do vídeo não encontrado.');
      }
    } else {
      console.error('Erro ao obter a página:', response.status, response.statusText);
    }
  } catch (error) {

  }
}

async function moviesFetch(imdbId) {

  const result = await db('osteusfilmestuga').where({ imdbId }).first();
  let urlAsnwish
  if (result) {
    if (result.srcWish !== null) {
      urlAsnwish = result.srcWish;
    }
    else {
      const updatedAt = new Date(result.updatedAt);
      const currentDate = new Date();

      const differenceInDays = (currentDate - updatedAt) / (1000 * 60 * 60 * 24);

      if (differenceInDays > 7) {
        const { title, year } = await fetchIMDBByID(imdbId);
        const normalize = normalizeStrings(title);

        let postId = await fetchPlayer(`https://osteusfilmestuga.online/filmes/${normalize[0]}/`);
        urlAsnwish = await fetchWpAdmin(postId, 2, 'movie')

        if (!urlAsnwish && normalize[1]) {
          postId = await fetchPlayer(`https://osteusfilmestuga.online/filmes/${normalize[1]}/`);
          urlAsnwish = await fetchWpAdmin(postId, 2, 'movie')
        }

        await db('osteusfilmestuga').update({ srcWish: urlAsnwish ? urlAsnwish : null, updatedAt: currentDate }).where({ imdbId })

      } else {
        urlAsnwish = undefined;
      }

    }

  } else {
    const { title, year } = await fetchIMDBByID(imdbId);
    const normalize = normalizeStrings(title);

    let postId = await fetchPlayer(`https://osteusfilmestuga.online/filmes/${normalize[0]}/`);
    urlAsnwish = await fetchWpAdmin(postId, 2, 'movie')

    if (!urlAsnwish && normalize[1]) {
      postId = await fetchPlayer(`https://osteusfilmestuga.online/filmes/${normalize[1]}/`);
      urlAsnwish = await fetchWpAdmin(postId, 2, 'movie')
    }


    if (urlAsnwish) {
      await db('osteusfilmestuga').insert({ imdbId, srcWish: urlAsnwish })
    } else {
      await db('osteusfilmestuga').insert({ imdbId, srcWish: null })
    }
  }

  if (urlAsnwish) {
    const m3u9 = await fetchM3u8Src(urlAsnwish)

    return [{
      name: 'Os Teus Filmes Tuga',
      url: m3u9,
      description: "🌍 Audio em Portugues (PT-PT)\n🌐 Fonte: https://osteusfilmestuga.online"
    }];
  } else {
    return []
  }

};

async function seriesFetch(imdbId) {
  const result = await db('osteusfilmestuga').where({ imdbId }).first();
  let urlAsnwish

  if (result) {
    if (result.srcWish !== null) {
      urlAsnwish = result.srcWish;
    }
    else {
      const updatedAt = new Date(result.updatedAt);
      const currentDate = new Date();

      const differenceInDays = (currentDate - updatedAt) / (1000 * 60 * 60 * 24);

      if (differenceInDays > 7) {
        const [id, season, episode] = imdbId.split(':')
        const { title, year } = await fetchIMDBByID(imdbId);
        const normalize = normalizeStrings(title);

        let postId = await fetchPlayer(`https://osteusfilmestuga.online/episodios/${normalize[0]}-${season}-x-${episode}/`);
        urlAsnwish = await fetchWpAdmin(postId, 2, 'tv')

        if (!urlAsnwish && normalize[1]) {
          let postId = await fetchPlayer(`https://osteusfilmestuga.online/episodios/${normalize[0]}-${season}-x-${episode}/`);
          urlAsnwish = await fetchWpAdmin(postId, 2, 'tv')
        }

        await db('osteusfilmestuga').update({ srcWish: urlAsnwish ? urlAsnwish : null, updatedAt: currentDate }).where({ imdbId })

      } else {
        urlAsnwish = undefined;
      }

    }
  } else {
    const [id, season, episode] = imdbId.split(':')
    const { title } = await fetchIMDBByID(id);
    const normalize = normalizeStrings(title);

    let postId = await fetchPlayer(`https://osteusfilmestuga.online/episodios/${normalize[0]}-${season}-x-${episode}/`);

    urlAsnwish = await fetchWpAdmin(postId, 2, 'tv')
    if (!urlAsnwish && normalize[1]) {
      postId = await fetchPlayer(`https://osteusfilmestuga.online/episodios/${normalize[1]}-${season}-x-${episode}/`);
      urlAsnwish = await fetchWpAdmin(postId, 2, 'tv')
    }

    if (urlAsnwish) {
      await db('osteusfilmestuga').insert({ imdbId, srcWish: urlAsnwish })
    } else {
      await db('osteusfilmestuga').insert({ imdbId, srcWish: null })
    }
  }

  if (urlAsnwish) {
    const m3u9 = await fetchM3u8Src(urlAsnwish)

    return [{
      name: 'Os Teus Filmes Tuga',
      url: m3u9,
      description: "🌍 Audio em Portugues (PT-PT)\n🌐 Fonte: https://osteusfilmestuga.online"
    }];
  } else {
    return []
  }

};

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