class Light extends THREE.SpotLight {
  constructor(color) {
    super(color);

    this.setup();
  }

  setup() {
    this.position.set(300, 500, net.kolor == 1 ? 300 : -300);
    console.log(net.kolor == 1 ? 300 : -300);
    //console.log(net.kolor)
    this.castShadow = true;

    this.shadow.mapSize.width = 1024;
    this.shadow.mapSize.height = 1024;

    this.shadow.camera.near = 500;
    this.shadow.camera.far = 4000;
    this.shadow.camera.fov = 30;


  }
}