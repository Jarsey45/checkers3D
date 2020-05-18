var game, ui, net;




$(document).ready(function () {
  net = new Net();
  ui = new Ui();
  game = new Game();



  $(window).resize(function () {
    game.resize();
  });

})