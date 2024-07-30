const STYLESHEET = `
* {
      box-sizing: border-box;
  }

  body,
  html {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
  }

  body {
      padding: 2vh;
      font-size: 2.2vh;
      display: flex;
      flex-direction: column;
      font-family: 'Open Sans', Arial, sans-serif;
      color: white;
      justify-content: space-between;
      align-items: center;
  }

  html {
      background-size: auto 100%;
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      box-shadow: inset 0 0 0 2000px rgb(0 0 0 / 60%);
  }

  h1 {
      font-size: 4.5vh;
      font-weight: 700;
  }

  h2 {
      font-size: 2.2vh;
      font-weight: normal;
      font-style: italic;
      opacity: 0.8;
  }

  h3 {
      font-size: 2.2vh;
  }

  h1,
  h2,
  h3,
  p {
      margin: 0;
      text-shadow: 0 0 1vh rgba(0, 0, 0, 0.15);
  }

  p {
      font-size: 1.75vh;
  }

  ul {
      font-size: 1.75vh;
      margin: 0;
      margin-top: 1vh;
      padding-left: 3vh;
  }

  a {
      color: white;
  }

  a.install-link {
      text-decoration: none;
  }

  button {
      border: 0;
      outline: 0;
      color: white;
      background: #8A5AAB;
      padding: 1.2vh 3.5vh;
      margin: auto;
      text-align: center;
      font-family: 'Open Sans', Arial, sans-serif;
      font-size: 2.2vh;
      font-weight: 600;
      cursor: pointer;
      display: block;
      box-shadow: 0 0.5vh 1vh rgba(0, 0, 0, 0.2);
      transition: box-shadow 0.1s ease-in-out;
  }

  button:hover {
      box-shadow: none;
  }

  button:active {
      box-shadow: 0 0 0 0.5vh white inset;
  }

  #addon {
      width: 63vh;
      margin: auto;
  }

  .logo {
      height: 14vh;
      width: 14vh;
      margin: auto;
      margin-bottom: 3vh;
  }

  .logo img {
      width: 100%;
  }

  .name,
  .version {
      display: inline-block;
      vertical-align: top;
  }

  .name {
      line-height: 5vh;
      margin: 0;
  }

  .version {
      position: relative;
      line-height: 5vh;
      opacity: 0.8;
      margin-bottom: 2vh;
  }

  .contact {
      width: 100%;
      text-align: center;
      margin-top: 2vh;
  }

  .contact a {
      font-size: 1.4vh;
      font-style: italic;
  }

  .separator {
      margin-bottom: 4vh;
  }

  .form-element {
      margin-bottom: 2vh;
  }

  .label-to-top {
      margin-bottom: 2vh;
  }

  .label-to-right {
      margin-left: 1vh !important;
  }

  .full-width {
      width: 100%;
  }

  .form-container {
      /*background: rgba(0, 0, 0, 0.7);*/
      padding: 2vh;
      border-radius: 1vh;
      margin-top: 2vh;
  }

  .form-container h2 {
      text-align: center;
      margin-bottom: 2vh;
      background: darkslateblue;
      padding: 10px;
      border-radius: 25px;
  }

  .pure-button-alternative {
      background: #8c52ff;
      color: white;
  }

  .pure-button-secondary {
      background: #1f253e;
      margin-left: 1vh;
      color: white;
  }

  .pure-button-success {
      background: #68df64;
  }

  .pure-controls {
      margin-top: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1vh;
  }

  .pure-button {
      width: 50%;
  }
`;

function landingTemplate(manifest) {
  const background = manifest.background || 'https://dl.strem.io/addon-background.jpg';
  const logo = manifest.logo || 'https://dl.strem.io/addon-logo.png';
  const contactHTML = manifest.contactEmail
    ? `<div class="contact">
<p>Contact ${manifest.name} creator:</p>
<a href="mailto:${manifest.contactEmail}">${manifest.contactEmail}</a>
</div>` : '';

  const stylizedTypes = manifest.types
    .map((t) => t[0].toUpperCase() + t.slice(1) + (t !== 'series' ? 's' : ''));

  return `
<!DOCTYPE html>
<html style="background-image: url(${background});">

<head>
<meta charset="utf-8">
<title>${manifest.name} - Stremio Addon</title>
<link rel="shortcut icon" href="${logo}" type="image/x-icon">
<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/purecss@2.1.0/build/pure-min.css" integrity="sha384-yHIFVG6ClnONEA5yB5DJXfW2/KC173DIQrYoZMEtBvGzmf0PKiGyNEqe9N6BNDBH" crossorigin="anonymous">
<style>${STYLESHEET}</style>
</head>

<body>
<div id="addon">
<div class="logo">
<img src="${logo}">
</div>
<h1 class="name">${manifest.name}</h1>
<h2 class="version">v${manifest.version || '0.0.0'}</h2>
<h2 class="description">${manifest.description || ''}</h2>

<div class="separator"></div>

<h3 class="gives">This addon has more :</h3>
<ul>
${stylizedTypes.map((t) => `<li>${t}</li>`).join('')}
</ul>

<div class="separator"></div>

<!-- Formulário de Login -->
        <div id="loginForm" class="form-container" style="display: none;">
            <h2><b>Login</b></h2>
            <form class="pure-form pure-form-stacked">
                <fieldset>
                    <div class="form-element">
                        <div class="label-to-top">Email</div>
                        <input id="login-email" type="email" placeholder="Email" class="full-width">
                    </div>
                    <div class="form-element">
                        <div class="label-to-top">Password</div>
                        <input id="login-password" type="password" placeholder="Password" class="full-width">
                    </div>
                    <div class="pure-controls" style="margin-top: 25px;">
                        <button type="submit" class="pure-button pure-button-alternative">Instalar Extensão</button>
                        <button id="toggleToRegister" type="button" class="pure-button pure-button-secondary">Não tenho
                            conta</button>
                    </div>
                </fieldset>
            </form>
        </div>

        <!-- Formulário de Registo -->
        <div id="registerForm" class="form-container" style="display: block;">
            <h2><b>Pedir Acesso</b></h2>
            <form class="pure-form pure-form-stacked">
                <fieldset>
                    <div class="form-element">
                        <div class="label-to-top">Nome de Utilizador</div>
                        <input id="register-name" type="text" placeholder="Nome de Utilizador" class="full-width">
                    </div>
                    <div class="form-element">
                        <div class="label-to-top">Email</div>
                        <input id="register-email" type="email" placeholder="Email" class="full-width">
                    </div>
                    <div class="form-element">
                        <div class="label-to-top">Password</div>
                        <input id="register-password" type="password" placeholder="Password" class="full-width">
                    </div>
                    <div class="form-element">
                        <div class="label-to-top" for=>Confirmar Password</div>
                        <input id="register-confirm-password" type="password" placeholder="Confirmar Password"
                            class="full-width">
                    </div>
                    <div style="display: flex;">
                        <input type="checkbox" id="news" name="news" checked />
                        <label style="margin-left: 5px;" for="news">Receber notificações de novos filmes
                            adicionados</label>
                    </div>
                    <div class="pure-controls">
                        <button type="button" class="pure-button pure-button-success">Submeter Pedido</button>
                        <button id="toggleToLogin" type="button" class="pure-button pure-button-secondary">Já tenho
                            conta</button>
                    </div>
                </fieldset>
            </form>
        </div>
${contactHTML}
</div>
<script src="public/validacaoinputs.js"></script>
<script src="public/requestfunctions.js"></script>
<script>

 document.getElementById('toggleToRegister').addEventListener('click', function () {
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('registerForm').style.display = 'block';
  });

  document.getElementById('toggleToLogin').addEventListener('click', function () {
      document.getElementById('registerForm').style.display = 'none';
      document.getElementById('loginForm').style.display = 'block';
  });
  document.querySelectorAll('input').forEach(input => {
      input.addEventListener('mouseover', function(event) {
        const errorMessage = event.target.getAttribute('data-error-message');
        if (errorMessage) {
          const tooltip = document.createElement('div');
          tooltip.className = 'tooltip-error';
          tooltip.textContent = errorMessage;
          tooltip.style.position = 'absolute';
          tooltip.style.backgroundColor = '#f44336';
          tooltip.style.color = '#fff';
          tooltip.style.padding = '5px';
          tooltip.style.borderRadius = '5px';
          tooltip.style.zIndex = '1000';
          tooltip.style.top = event.target.offsetTop + event.target.offsetHeight+"px";
          tooltip.style.left = event.target.offsetLeft+"px";
          tooltip.setAttribute('id', 'tooltip-error');
          document.body.appendChild(tooltip);
        }
      });

      input.addEventListener('mouseout', function() {
        const tooltip = document.getElementById('tooltip-error');
        if (tooltip) {
          tooltip.remove();
        }
      });
    });
</script>


</body>

</html>`;
}

module.exports = landingTemplate;
