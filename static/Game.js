class Game {

  constructor() {

    //SCENE
    this.scene = new THREE.Scene();
    //CAMERA
    this.camera = new THREE.PerspectiveCamera(90, $(window).width() / $(window).height(), 0.1, 10000);
    this.camera.position.set(0, 500, 500);
    //RENDERER
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setClearColor(0x515151);
    this.renderer.setSize($(window).width(), $(window).height());
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //RAYCASTER
    this.raycaster = new THREE.Raycaster();
    this.mousePos = new THREE.Vector2();
    //this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    //COMPOSER AND OUTLINE
    this.composer = new THREE.EffectComposer(this.renderer);

    this.renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.outlinePass = new THREE.OutlinePass(new THREE.Vector2($(window).width(), $(window).height()), this.scene, this.camera);
    this.composer.addPass(this.outlinePass);

    this.effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    this.effectFXAA.uniforms['resolution'].value.set(1 / $(window).width(), 1 / $(window).height());
    this.effectFXAA.renderToScreen = true;
    this.composer.addPass(this.effectFXAA);

    this.outlinedObjects = [];
    //LIGHT
    this.light;
    $("#root").append(this.renderer.domElement);


    this.szachownica = [ // białe - 1, czarne -0
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0]

    ]


    // [1, 0, 1, 0, 1, 0, 1, 0],
    //   [0, 1, 0, 1, 0, 1, 0, 1],
    //   [0, 0, 2, 0, 2, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 2, 0],
    //   [0, 1, 0, 1, 0, 0, 0, 0],
    //   [2, 0, 2, 0, 2, 0, 2, 0],
    //   [0, 2, 0, 2, 0, 2, 0, 2]
    this.verifiedSpacing = [ // puste - 0, biale - 1, czarne - 2
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 0, 2, 0, 2, 0, 2, 0],
      [0, 2, 0, 2, 0, 2, 0, 2]
    ];


    this.pionki = [];
    this.selectedPionek = '';
    this.dozwolone = [];
    this.wPionek = new THREE.TextureLoader().load('img/wPionek.jpg');
    this.dPionek = new THREE.TextureLoader().load('img/dPionek.jpg');


    //this.setup();
    this.render() // wywołanie metody render



  }

  setup() {
    //AXES HELPER JAKIS
    // let axesHelper = new THREE.AxesHelper(10000);
    // this.scene.add(axesHelper);


    //this.controls.update();

    let white = new THREE.TextureLoader().load('img/white.jpg');
    let dark = new THREE.TextureLoader().load('img/dark.jpg');


    for (let i = 0; i < this.szachownica.length; i++) { // plansza
      for (let j = 0; j < this.szachownica[0].length; j++) {
        if (this.szachownica[i][j] == 1) {
          let kolor = 'white';
          let cos = new Plansza((100 * i) - 350, 0, (100 * j) - 350, kolor, white, dark, this.scene, i, j);
          this.szachownica[i][j] = cos;

          cos.show()
        } else {
          let kolor = 'black';
          let cos = new Plansza((100 * i) - 350, 0, (100 * j) - 350, kolor, white, dark, this.scene, i, j);
          this.szachownica[i][j] = cos;
          cos.show()

        }
      }
    }



    for (let i = 0; i < net.spacing.length; i++) { // plansza
      for (let j = 0; j < net.spacing[0].length; j++) {
        if (net.spacing[i][j] == 1) {
          //console.log((100 * j) - 350, j)
          this.addPionek(1, (100 * j) - 350, 0, (100 * i) - 350, i, j)
        } else if (net.spacing[i][j] == 2) {
          //console.log('czarny')
          this.addPionek(0, (100 * j) - 350, 0, (100 * i) - 350, i, j)
        }
      }
    }




    //swiatlo
    this.light = new Light(0xffffff);

    this.scene.add(this.light);


    //ONCLICK 
    $("#root").on('click', function (e) {
      game.mousePos.x = (e.clientX / $(window).width()) * 2 - 1;
      game.mousePos.y = -(e.clientY / $(window).height()) * 2 + 1;

      game.raycaster.setFromCamera(game.mousePos, game.camera);

      let intersects = game.raycaster.intersectObjects(game.scene.children, true);
      //console.log(intersects[0]);
      if (intersects[0] && //czy istnieje
        net.turn == net.kolor && // czy jest nasza tura
        (intersects[0].object.kolor == (net.kolor == 0 ? 'dark' : 'white') || // pzowala na zaznaczanie tylko naszego koloru oraz
          intersects[0].object.name == 'plansza') // oraz elementow planszty
      ) {

        if (intersects[0].object.kolor) { // poruszanie 

          game.selectedPionek = intersects[0].object; //wybiora pionek ktory nacisnelo sie

        } else if (intersects[0].object.name == 'plansza' && game.selectedPionek != '') { //sprawdza czy wybrany element planszy  jest plansza oraz czy jest wybrany pionek
          for (let el of game.dozwolone) {
            if (el.miejsce.mesh.userData.idX == intersects[0].object.userData.idX && //sprawdzanie czy wybrane pole nalezy do dozwolonych poprzez findPossible()
              el.miejsce.mesh.userData.idY == intersects[0].object.userData.idY) {

              game.move(game.selectedPionek, game.szachownica[intersects[0].object.userData.idX][intersects[0].object.userData.idY]); //porusza pionek do miejsca
              for (let pionek of game.pionki) {
                if (pionek.idX == el.straty.x && pionek.idY == el.straty.y) {
                  //console.log(pionek);
                  net.playerScore++;
                  game.zabij(pionek);
                }
              }
              game.selectedPionek = ''; //odselectowanie pionka

              break;
            }
          }
        }

        game.outlinedObjects = []; // jakies gowno z outlinem dunno
        game.outlinedObjects.push(intersects[0].object);
        game.outline(); //rysowanie outline
        game.findPossible(intersects[0].object); //zanjdujemy wszystkie mozliwe posuniecia TODO: zbijanie
      } else {
        alert('to nie twoja tura') //alert
      }

    })


  }

  addPionek(kolor, x, y, z, idX, idY) {
    let pionek, material;
    let geometry = new THREE.CylinderGeometry(40, 40, 45, 32);


    if (kolor == 1) {
      material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        map: this.wPionek,
        transparent: true

      });
      pionek = new Pionek(geometry, material, 'white', idX, idY);
      //pionek.castShadow = true;

    } else {
      material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        map: this.dPionek,
        transparent: true

      });
      pionek = new Pionek(geometry, material, 'dark', idX, idY);
      //pionek.castShadow = true;

    }
    pionek.position.set(x, y, z);


    this.pionki.push(pionek);
    this.scene.add(pionek);
  }

  render() {
    requestAnimationFrame(this.render.bind(this)); // funkcja bind(this) przekazuje obiekt this do metody render

    // for (let i of this.pionki) {
    //   i.mesh.position.set(100, 0, 200);
    //   this.scene.add(i)
    // }





    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
    this.camera.lookAt(new THREE.Vector3());
    //this.controls.update();
    //console.log("render leci")
    this.composer.render();
  }

  resize() {

    this.camera.aspect = $(window).width() / $(window).height();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize($(window).width(), $(window).height());

  }

  outline() {
    game.outlinePass.visibleEdgeColor.set('#00FF00'); //kolor
    game.outlinePass.edgeStrength = 50; //natezenie
    game.outlinePass.edgeThickness = 0.5; //grubosc

    game.outlinePass.selectedObjects = this.outlinedObjects; //obiekty ktorym nadac outline
  }

  findPossible(obj) { // sprawdza dostepne ruchy i podswietla je
    let x = obj.idX;
    let y = obj.idY;
    this.dozwolone = []; //zerowanie mozliwych

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (x + i >= 0 && //sprawdzanie mozliwych pozycji wersja podstawowa
          x + i <= 7 &&
          y + j >= 0 &&
          y + j <= 7 &&
          this.szachownica[x + i][y + j].color == 'black') { // IF HELL STARTS NOW
          if (net.kolor == 1 ? (x + i > x) : (x + i < x)) { // brak mozliwosci cofania
            if (this.verifiedSpacing[x + i][y + j] == 0) { // jezeli jest puste pole


              this.outlinedObjects.push(this.szachownica[y + j][x + i].mesh);
              this.dozwolone.push({
                miejsce: this.szachownica[y + j][x + i],
                straty: {
                  x: undefined,
                  y: undefined
                }
              }); //dodanie ich do dozwolonych
              this.outline();
            } else if (this.verifiedSpacing[x + i][y + j] == (net.kolor == 1 ? 2 : 1)) { //jezeli na polu jest przeciwnik

              if (net.kolor == 1) {
                if (x + j < x) {
                  if (this.verifiedSpacing[x + 1 + i][y - 1 + j] == 0) {
                    this.outlinedObjects.push(this.szachownica[y - 1 + j][x + 1 + i].mesh);
                    this.dozwolone.push({
                      miejsce: this.szachownica[y - 1 + j][x + 1 + i],
                      straty: {
                        x: x + i,
                        y: y + j
                      }
                    });
                  }
                } else if (x + j > x) {
                  if (this.verifiedSpacing[x + 1 + i][y + 1 + j] == 0) {
                    console.log(x + 1 + i, y + 1 + j)
                    this.outlinedObjects.push(this.szachownica[y + 1 + j][x + 1 + i].mesh);
                    this.dozwolone.push({
                      miejsce: this.szachownica[y + 1 + j][x + 1 + i],
                      straty: {
                        x: x + i,
                        y: y + j
                      }
                    });
                  }
                }

              } else {
                if (x + j > x) {
                  if (this.verifiedSpacing[x - 1 + i][y + 1 + j] == 0) {
                    this.outlinedObjects.push(this.szachownica[y + 1 + j][x - 1 + i].mesh);
                    this.dozwolone.push({
                      miejsce: this.szachownica[y + 1 + j][x - 1 + i],
                      straty: {
                        x: x + i,
                        y: y + j
                      }
                    });
                  }
                } else if (x + j < x) {
                  if (this.verifiedSpacing[x - 1 + i][y - 1 + j] == 0) {
                    //console.log(x - 1 + i, y - 1 + j)
                    this.outlinedObjects.push(this.szachownica[y - 1 + j][x - 1 + i].mesh);
                    this.dozwolone.push({
                      miejsce: this.szachownica[y - 1 + j][x - 1 + i],
                      straty: {
                        x: x + i,
                        y: y + j
                      }
                    });
                  }
                }

              }

            }

          }

        }

      }
    }
  }

  move(pionek, place) {
    //console.log(pionek, place)

    //update INSTRUCITON
    net.instruction = {
      player: { //ruch pionka
        prevX: pionek.idX,
        prevY: pionek.idY,
        x: place.mesh.userData.idY,
        y: place.mesh.userData.idX
      },
      enemy: { //ewentualne zbijanie

      }
    }

    //update SPACING
    net.spacing[pionek.idX][pionek.idY] = 0;
    net.spacing[place.mesh.userData.idY][place.mesh.userData.idX] = (net.kolor == 1 ? 1 : 2);
    console.log(net.spacing)

    //update pionek X Y Z
    let x = place.mesh.position.x;
    let y = place.mesh.position.y;
    let z = place.mesh.position.z;
    pionek.position.set(x, y, z)


    //update pionek idX ,idY 
    pionek.idX = place.mesh.userData.idY;
    pionek.idY = place.mesh.userData.idX;

    net.nextRound = 1;
  }

  update(instr) {
    //docelowe miejsce X Y Z
    let place = this.szachownica[instr.player.y][instr.player.x]
    let x = place.mesh.position.x;
    let y = place.mesh.position.y;
    let z = place.mesh.position.z;

    //Aktualny PIONEK
    let pionek;
    for (let el of this.pionki) {
      if (el.idX == instr.player.prevX && el.idY == instr.player.prevY) {
        pionek = el;
        pionek.position.set(x, y, z);
        pionek.idX = instr.player.x;
        pionek.idY = instr.player.y;
        break;
      }
    }

    //aktualizacja miejsca posyzji w 3d ORAZ aktualizacja idX idY
    //pionek.position.set(x, y, z)


    //kill pionek

    for (let p of game.pionki) {
      if (typeof instr.enemy != 'undefined') {
        if (p.idX == instr.enemy.x && p.idY == instr.enemy.y) {
          //console.log(p)
          game.zabij(p);
        }
      }
    }

  }

  zabij(pionek) {
    if (typeof net.instruction.enemy != 'undefined') {
      net.instruction.enemy = {
        what: 'kill',
        x: pionek.idX,
        y: pionek.idY
      }


    }

    net.spacing[pionek.idX][pionek.idY] = 0;
    this.scene.remove(pionek);

  }

  reset() {

  }


}