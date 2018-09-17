class MainScene extends Scene {
  init(options) {
    this.add(new THREE.AmbientLight(0xffffff))
    this.model = AssetManager.get('mole.json')
    this.model.position.set(0, -1, 0)
    this.add(this.model)

    this.animation = new CyclicArray([
      this.model.animations[0],
      this.model.animations[1],
      this.model.animations[3],
      this.model.animations[4],
      this.model.animations[5],
    ])

    this.sky = new Sky()
    this.sky.addToScene(this)
    this.sky.updateSun(this.sky.distance, this.sky.inclination, this.sky.azimuth)

    let camera = Hodler.get('camera');
    camera.position.set(0, 2, 3)
    camera.lookAt(new THREE.Vector3(0, 1, 0))
  }

  nextAnimation() {
    this.animation.next()
    this.model.animations.forEach(function (animation) {
      animation.stop()
    })
    this.animation.get().play()
  }

  doKeyboardEvent(event) {
    if (event.type !== "keyup") {
      return
    }
    this.nextAnimation()
  }
}

class LoadingScene extends MainScene {
  init(options) {
    var geometry = new THREE.BoxGeometry( 1, 1, 1 )
    var material = new THREE.MeshBasicMaterial({ color: 'red' })
    this.model = new THREE.Mesh(geometry, material)
    this.add(this.model)

    AssetManager.loadAssets([
      { type: 'model', path: 'mole.json' },
    ], function () {
      Engine.switchScene(Hodler.get('mainScene'))
    })
  }

  tick(tpf) {
    this.model.rotation.x += tpf
    this.model.rotation.y += tpf
  }
}

AfterEffects.prototype.effects = function () {
  effectBloom = new (THREE.BloomPass)(1.25)
  // effectCopy = new (THREE.ShaderPass)(THREE.CopyShader)
  // effectCopy.renderToScreen = true
  effectFilm = new (THREE.FilmPass)(0.15, 0.15, 2048, false)
  effectFilm.renderToScreen = true

  this.composer.addPass(this.renderModel)
  this.composer.addPass(effectBloom)
  // this.composer.addPass effectCopy
  this.composer.addPass(effectFilm)
}

var loadingScene = new LoadingScene()
var mainScene = new MainScene()
Hodler.add('mainScene', mainScene)

Engine.start(loadingScene)

let camera = Hodler.get('camera');
camera.position.set(0, 2, 3)
camera.lookAt(new THREE.Vector3(0,0,0))

Hodler.get('afterEffects').enable()
