const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    pool: true,
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use TLS
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PWD,
    },
});

// Função para gerar o conteúdo HTML do email
function generateEmailContent(movies) {
    let movieHtml = movies.map(movie => `
        <div class="movie clearfix">
            <img src="${movie.poster}" alt="Poster do Filme/Programa">
            <p><strong>Título:</strong> ${movie.name}</p>
            <p><strong>ID IMDB:</strong> ${movie.id}</p>
            <p><strong>Tipo:</strong> ${movie.type}</p>
        </div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dados dos Filmes/Programas</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .logo {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo img {
                    max-width: 100px;
                    height: auto;
                }
                .title {
                    font-size: 24px;
                    color: #333333;
                    text-align: center;
                }
                .movie {
                    margin-top: 20px;
                    padding: 10px;
                    border: 1px solid #dddddd;
                    border-radius: 8px;
                    background-color: #fafafa;
                }
                .movie img {
                    max-width: 100px;
                    height: auto;
                    border-radius: 8px;
                    float: left;
                    margin-right: 20px;
                }
                .movie p {
                    margin: 5px 0;
                    color: #555555;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    color: #888888;
                }
                .clearfix::after {
                    content: "";
                    clear: both;
                    display: table;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <img src="https://i.ibb.co/JjFByHZ/Tuga-Stream-1.png" alt="Logo">
                </div>
                <h1 class="title">Dados dos Filmes/Programas</h1>
                ${movieHtml}
                <div class="footer">
                    <p>Este é um e-mail automático. Por favor, não responda.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}



// Enviar o email


function sendEmailWithNewMovies(movies, to = process.env.SEND_TO) {
    const mailOptions = {
        from: 'TugaPlay - No Reply <no_reply@tugaplay.com>',
        bcc: to,
        subject: 'Dados dos Filmes/Programas',
        html: generateEmailContent(movies),
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
}

module.exports = {
    sendEmailWithNewMovies
}