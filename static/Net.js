class Net {
  constructor() {
    this.kolor = 0; // 0 - czarny 1 -bialy
    this.gameState = 0; // 0 - nie rozpoczeta, 1 - aktywna, 2 - skonczona, 
    this.turn = 0; // 0 - czarny, 1 - bialy
    this.playerScore = 0;
    this.enemyScore = 0;
    this.spacing = [ // puste - 0, biale - 1, czarne - 2
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 2, 0, 2, 0, 2, 0],
      [0, 2, 0, 2, 0, 2, 0, 2]
    ];
    this.username;
    this.enemyUsername;
    this.instruction;
    this.nextRound = 0;
  }

  addUser(name) {
    $.ajax({
      url: '/ADD_USER',
      type: 'post', // performing a POST request
      data: JSON.stringify({
        "user": name
      }),
      dataType: 'json',
      success: function (data) {
        net.username = name;
        console.table(data);
        ui.changeNav(data.text);
        if (data.side == 1) {
          net.kolor = 1; //'white';
        } else {
          net.kolor = 0; //'dark';
        }


        game.setup(); // show plansza i pionki
        game.camera.position.set(0, 500, data.side ? -500 : 500);
        net.turn = data.side == 1 ? 1 : 0;



        setInterval(function () {
          net.update();

        }, 500)
      }
    });

  }

  deleteUser() {
    if (this.username) {
      $.ajax({
        url: '/DELETE_USER',
        type: 'post', // performing a POST request
        data: JSON.stringify({
          username: net.username
        }),
        dataType: 'json',
        success: function (data) {

        }
      });
    }

  }


  update() { // 0 - nie rozpoczeta - czekamy, 1 - aktywna, 2 - skonczona, 
    // console.log({
    //   username: net.username,
    //   spacing: net.spacing,
    //   state: net.gameState,
    //   playerScore: net.playerScore,
    //   enemyScore: net.enemyScore,
    //   turn: net.turn,
    // })
    //console.log(this.turn)
    $.ajax({
      url: '/UPDATE_STATE',
      type: 'post', // performing a POST request
      data: JSON.stringify({ // best tego jezeli chcemy express
        username: net.username,
        spacing: net.spacing,
        state: net.gameState,
        playerScore: net.playerScore,
        enemyScore: net.enemyScore,
        turn: net.kolor,
        next: net.nextRound,
        instruction: net.instruction
      }),
      dataType: 'json',
      success: function (data) {
        //console.log(data)

        if (net.gameState == 0 && data.error == 1) {
          game.reset();
        }
        if (data.error == 0) {
          net.gameState = 0;
        } else if (data.error == 1) {
          net.turn = data.kolejka;
          net.spacing = data.spacing;
          net.enemyUsername = data.enemyNick;
          net.enemyScore = data.enemyScore;
          game.verifiedSpacing = data.spacing;
          net.gameState = 1;
          net.instruction = data.instruction;

          if (typeof net.instruction == 'object') {
            //console.log(net.instruction)
            //console.log('aaa')
            game.update(net.instruction);
            net.instruction = undefined;
          }
        } else if (data.error == 2) {
          net.gameState = 2;
        } else {
          net.gameState = 400;
        }
        ui.update(net.gameState)
        console.log("GAME STATE: " + net.gameState)


        //Update tura
        $("#tura").html(`Kolejka dla gracza ${net.turn == net.kolor ? `<span style="color:blue">${net.username}</span>` : `<span style="color:red">${net.enemyUsername}</span>`}`);


      }
    });
  }
}