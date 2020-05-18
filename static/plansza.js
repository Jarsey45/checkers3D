class Plansza {
  constructor(x, y, z, color, white, dark, scene, idx, idy) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.white = white;
    this.dark = dark;
    this.color = color;
    this.scene = scene;
    this.size = 100;


    this.idX = idx;
    this.idY = idy;
    this.mesh;
    this.show();
  }

  show() {
    //console.table(this.x, this.y, this.z, this.color)

    var geometry = new THREE.BoxGeometry(this.size, 20, this.size);
    if (this.color == 'white') {
      var material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        map: this.white,
        transparent: true

      })

    } else {
      var material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        map: this.dark,
        transparent: true

      })
    }
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;
    this.mesh.name = 'plansza';
    this.mesh.userData.idX = this.idX;
    this.mesh.userData.idY = this.idY;
    this.mesh.position.x = this.x;
    this.mesh.position.y = this.y;
    this.mesh.position.z = this.z;
    this.scene.add(this.mesh);

  }


}