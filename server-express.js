//zmienne, stałe

const express = require("express")
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

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


app.use(express.static('static')); // serwuje stronę index.html
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));



app.post('/ADD_USER', function (req, res) {
  console.log(req.body)
  if (users.length <= 1) {


    if (users[0]) {
      if (req.body.user == users[0]) {

      }
      var obj = {
        username: req.body.user,
        side: users[0].side == 0 ? 1 : 0, // 0 - czarne; 1 - biale
        score: 0,
        //map: plansza
      };
    } else {
      var obj = {
        username: req.body.user,
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

});

app.post('/DELETE_USER', function (req, res) {

  for (let [index, user] of users.entries()) {
    if (req.body.username == user.username) {
      users.splice(index, 1);
      console.log(users)
    }
  }

  turn = 1;

  res.end();

});


app.post('/UPDATE_STATE', function (req, res) { // 0 - nie rozpoczeta, 1 - aktywna, 2 - skonczona, 

  if (users.length == 2) { // jest dwoch graczy
    for (let [i, user] of users.entries()) { // wertujemy przez graczy
      if (req.body.username == user.username) { // isnieje gracz o danym nicku
        if (req.body.turn == turn) { // czy to jego tura?
          plansza = req.body.spacing;
          user.score = req.body.playerScore;
          instruction = req.body.instruction;



          // console.log(req.body.spacing)
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


          // if (req.body.next == 1) {
          //   turn = turn == 1 ? 0 : 1;
          // }
          // console.log(req.body.username + '- jest, jego tura')
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


          // console.log(req.body.username + '- jest, nie jego tura')
          res.end(JSON.stringify(json));
        }
        break;
        //console.log('update')
      } else { // nie istnieje taki gracz
        //console.log(req.body.username + '- brak gracza')
        //res.end('HUUUUJ');
      }
    }
  } else if (users.length == 1) { // jest jeden gracz tylko, oczekiwaie
    let json = {
      kolejka: turn,
      spacing: plansza,
      error: 0
    }
    // console.log(req.body.username + ' - brakuje drugiego gracza, oczekiwanie')
    res.end(JSON.stringify(json))
  } else { // nie ma graczy lub jest ich za duzo(obserwowanie)
    let json = {
      kolejka: turn,
      spacing: plansza,

      error: 400
    }

    console.log(req.body.username + '- sie zjebało :/')
    res.end(JSON.stringify(json))
  }


});








//otwieranie serwera na porcie
app.listen(PORT, () => {
  console.log("Start serwera na porcie: " + PORT)
})