class Ui {
  constructor() {

    this.setup();
  }

  add() {
    $("#btLog").on('click', function () {
      net.addUser($("#nick").val())
      ui.hide();
    })
  }

  reset() {
    $("#btReset").on('click', function () {
      $("#nick").val("");
      $.ajax({
        url: '/RESET',
        type: 'post', // performing a POST request
        data: JSON.stringify({}),
        dataType: 'json',
        success: function (data) {
          console.log('reset')
        }
      });
    });
  }

  changeNav(content) {
    $("#status").html(`<p >${content}</p>`)
  }

  update(state) { // 0 - nie rozpoczeta, 1 - aktywna, 2 - skonczona, 
    switch (state) {
      case 0:
        this.changeNav("GRA NIE ROZPOCZETA CZEKANIE NA DRUGIEGO GRACZA")
        break;
      case 1:
        this.changeNav(`GRAMY!!! <span style="color:blue">${net.username}</span>: ${net.playerScore}<span style="color:red"> ${net.enemyUsername}</span>: ${net.enemyScore}`)
        break;
      case 2:
        this.changeNav("wYGRAŁES LUB PRZEGRALES ... jeszcze nie wiem xD")
        break;
      default:
        this.changeNav("COS SIE COS SIE POPSUŁO")
        break;
    }
  }

  hide() {
    console.log('ukryj')
    $("#login").hide();
    //$("#login").show();
  }



  setup() {
    console.log('setup')
    this.add();
    this.reset();

    window.onbeforeunload = function () {
      net.deleteUser();
      location.reload(true);
      return true;
    }

  }


}