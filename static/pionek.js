class Pionek extends THREE.Mesh {
  constructor(geometry, material, kolor, idx, idy) {
    super(geometry, material);

    this.kolor = kolor;
    this.idX = idx;
    this.idY = idy;
    //this.id = 0;

    //console.log(this)
    this.show();
  }

  show() {
    this.castShadow = true;

  }

}