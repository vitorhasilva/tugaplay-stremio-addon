const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (id) => {


  const res = await axios.get(`https://www.imdb.com/title/${id}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept-Language': 'pt-PT,pt;q=0.9'
    }
  });

  const html = res.data;

  const $ = cheerio.load(html);

  const nextData = $('#__NEXT_DATA__').html();
  const jsonData = JSON.parse(nextData);

  const titleText = jsonData.props.pageProps.mainColumnData.titleText.text
  const originalTitleText = jsonData.props.pageProps.mainColumnData.originalTitleText.text
  const releaseYear = jsonData.props.pageProps.mainColumnData.releaseYear.year

  if (originalTitleText === titleText)
    return {
      title: [originalTitleText],
      year: releaseYear
    }
  else
    return {
      title: [originalTitleText, originalTitleText === titleText ? undefined : titleText],
      year: releaseYear
    }



}