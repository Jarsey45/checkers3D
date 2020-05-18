const http = require("http");
const fs = require('fs');


let users = [];
let instruction = undefined;
let turn = 1; // 0 - czarne 1 biale
let plansza = [ // puste - 0, biale - 1, czarne - 2
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 2, 0, 2, 0, 2, 0],
  [0, 2, 0, 2, 0, 2, 0, 2]
];






const server = http.createServer(function (req, res) {
  //console.log(req.url)
  // parametr res oznacza obiekt odpowiedzi serwera (res)
  // parametr req oznacza obiekt żądania klienta (req)

  //console.log(req.url)
  switch (req.method) {
    case "GET":
      if (req.url == '/') {
        fs.readFile('static/index.html', function (err, data) {
          res.setHeader('Content-type', 'text/html');
          res.end(data);
        })
      } else {

        fs.readFile('static' + req.url, function (err, data) {
          if (!err) {
            var dotoffset = req.url.lastIndexOf('.');
            var mimetype = dotoffset == -1 ?
              'text/plain' : {
                '.html': 'text/html',
                '.ico': 'image/x-icon',
                '.jpg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.css': 'text/css',
                '.js': 'text/javascript',
              } [req.url.substr(dotoffset)];
            res.setHeader('Content-type', mimetype);
            res.end(data);

          }
        });
      }



      break;
    case "POST":


      if (req.url == "/ADD_USER") { //odczytywanie do ajaxa

        postRequest(req).then(function (body) {

            if (users.length <= 1) {


              if (users[0]) {
                if (body.user == users[0]) {

                }
                var obj = {
                  username: body.user,
                  side: users[0].side == 0 ? 1 : 0, // 0 - czarne; 1 - biale
                  score: 0,
                  //map: plansza
                };
              } else {
                var obj = {
                  username: body.user,
                  side: users.length,
                  score: 0,
                  //map: plansza
                };
              }




              users.push(obj);

              let tekst = obj.side == 0 ? '<span style="color:black;">czarny</span>' : '<span style="color:white;">bialy</span>';
              let json = {
                text: `
              ADD_USER </br>
              Witaj <span style="color:red;">${obj.username}</span>, kolor: ${tekst}`,

                side: obj.side
              }

              res.end(JSON.stringify(json));

            } else {

              let tekst = 'Max graczy osiagniety, ale mozesz obserwowac';
              let json = {
                text: tekst,
                side: 0
              };
              res.end(JSON.stringify(json));

            }

            console.log(users);
          })
          .catch(function (err) {
            console.log(err)
          })

      } else if (req.url == "/DELETE_USER") {
        postRequest(req).then((body) => {
            for (let [index, user] of users.entries()) {
              if (body.username == user.username) {
                users.splice(index, 1);
                console.log(users)
              }
            }

            turn = 1;

            res.end();
          })
          .catch((e) => {
            console.log(e);
            res.end();
          })


      } else if (req.url == "/UPDATE_STATE") { // O HUJ CHODZI JAPIERDOLE XD

        postRequest(req).then((body) => {
            //console.log(users.length)
            if (users.length == 2) { // jest dwoch graczy
              for (let [i, user] of users.entries()) { // wertujemy przez graczy
                if (body.username == user.username) { // isnieje gracz o danym nicku
                  if (body.turn == turn) { // czy to jego tura?
                    plansza = body.spacing;
                    user.score = body.playerScore;
                    instruction = body.instruction;



                    // console.log(body.spacing)
                    // console.log(plansza)
                    // console.log(turn)
                    let json = {
                      kolejka: turn,
                      spacing: plansza,
                      enemyScore: i == 1 ? users[0].score : users[1].score,
                      enemyNick: i == 1 ? users[0].username : users[1].username,
                      instruction: instruction,
                      error: 1
                    };


                    // if (body.next == 1) {
                    //   turn = turn == 1 ? 0 : 1;
                    // }
                    //console.log(body.username + '- jest, jego tura')
                    res.end(JSON.stringify(json));
                  } else { // nie jego tura
                    let json = {
                      kolejka: turn,
                      spacing: plansza,
                      enemyScore: i == 1 ? users[0].score : users[1].score,
                      enemyNick: i == 1 ? users[0].username : users[1].username,
                      instruction: instruction,
                      error: 1
                    };

                    //zmiana strony
                    if (typeof instruction == 'object') {
                      turn = turn == 1 ? 0 : 1;
                    }

                    //reset instruckji
                    // console.log(instruction)
                    instruction = undefined;


                    //console.log(body.username + '- jest, nie jego tura')

                    res.end(JSON.stringify(json));
                  }
                  break;
                  //console.log('update')
                } else { // nie istnieje taki gracz
                  //console.log(body.username + '- brak gracza')
                  //res.end();
                }
              }
            } else if (users.length == 1) { // jest jeden gracz tylko, oczekiwaie
              let json = {
                kolejka: turn,
                spacing: plansza,
                error: 0
              }
              //console.log(body.username + ' - brakuje drugiego gracza, oczekiwanie')
              res.end(JSON.stringify(json))
            } else { // nie ma graczy lub jest ich za duzo(obserwowanie)
              let json = {
                kolejka: turn,
                spacing: plansza,

                error: 400
              }

              //console.log(body.username + '- sie zjebało :/')
              res.end(JSON.stringify(json))
            }

          })
          .catch((e) => {
            console.log(e);
            res.end();
          })



      } else if (req.url == "/RESET") {
        postRequest(req).then((body) => {
          users = [];
          console.log(users)

        }).catch((e) => {
          console.log(e);
          res.end();
        })
      }

      break;
    default:
      break;
  }





})




server.listen(3000, function () {
  console.log("serwer startuje na porcie " + 3000);
});




function postRequest(req) {
  return new Promise(function (resolve, reject) {
    var body = '';
    req.on('data', function (chunk) {
      body += chunk
    });
    req.on('end', function () {
      try {

        body = JSON.parse(body);
        //console.log(body)
        //console.log(body)
      } catch (e) {
        reject(e);
      }
      resolve(body);
    });
  });
}