const { JSDOM } = require('jsdom');

module.exports = async function SteamtapeGetDlLink(link) {
  try {
    if (link.includes("/e/")) {
      link = link.replace("/e/", "/v/");
    }

    const response = await fetch(link);
    const htmlSource = await response.text();

    const norobotLinkPattern = /document\.getElementById\('norobotlink'\)\.innerHTML = (.+);/;
    const norobotLinkMatch = htmlSource.match(norobotLinkPattern);

    if (norobotLinkMatch) {
      const norobotLinkContent = norobotLinkMatch[1];
      const tokenPattern = /token=([^&']+)/;
      const tokenMatch = norobotLinkContent.match(tokenPattern);

      if (tokenMatch) {
        const token = tokenMatch[1];
        const dom = new JSDOM(htmlSource);
        const divElements = dom.window.document.querySelectorAll("div#ideoooolink[style='display:none;']");

        if (divElements.length > 0) {
          const streamtape = divElements[0].textContent.trim();
          const fullUrl = `https:/${streamtape}&token=${token}`;
          return `${fullUrl}&dl=1s`;
        }
      }
    }
  } catch (exception) {
    console.error(exception);
  }

  return null;
}
