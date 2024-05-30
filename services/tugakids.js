const axios = require('axios')

async function checkExists(id) {
  try {
    const response = await axios.head(`https://tkapp24.buzz/${id.substring(2)}.mp4`);
    return !(response.headers['content-disposition'] && response.headers['content-disposition'].includes('attachment'))
  } catch (error) {
    return false
  }
};

module.exports = async (type, id) => {
  if (type === 'movie') {
    const exists = await checkExists(id)
    if (exists) {
      return {
        name: "TugaKids.com",
        url: `https://tkapp24.buzz/${id.substring(2)}.mp4`,
        description: "Audio em Portugues (PT-PT)"
      }
    }
    else return undefined;
  } else if (type === 'serie') {
    return undefined;
  } else
    return undefined;

}