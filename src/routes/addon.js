const router = require('express').Router();

const manifest = require('../config/manifest');
const landingTemplate = require('../utils/landingTemplate');

const landingHTML = landingTemplate(manifest);

module.exports = (/* app */) => {
  router.get('/', (req, res) => {
    res.redirect('/configure');
  });

  router.get('/manifest.json', (req, res) => {
    const newManifest = {
      ...manifest,
      behaviorHints: {
        ...manifest.behaviorHints,
        configurationRequired: true,
      },
    };
    res.status(200).json(newManifest);
  });

  router.get('/configure', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(landingHTML);
  });

  router.get('/:token/:resource/:type/:id', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).json({
      token: req.params.token,
      resource: req.params.resource,
      type: req.params.type,
      id: req.params.id,
    });
  });
  return router;
};