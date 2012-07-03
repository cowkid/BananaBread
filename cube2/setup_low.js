
Module.setPlayerModels = function() {
  BananaBread.setPlayerModelInfo("frankie", "frankie", "frankie", 0, "nada", 0, 0, 0, 0, "frankie", "frankie", "frankie", false);
};

Module.tweakDetail = function() {
  BananaBread.execute('fog 10000'); // disable fog
  BananaBread.execute('maxdebris 10');

  //BananaBread.execute('sensitivity 15');

  new CameraPath({
    steps: [{
      position: LinearMath.vec3.create([660.6883, 423.9656, 578.6837]),
      orientation: LinearMath.vec3.create([7.273222, 18.63635, 0.0])
    }, {
      position: LinearMath.vec3.create([215.5453, 437.4472, 715.4446]),
      orientation: LinearMath.vec3.create([-30.4548, -49.09093, 0.0])
    }],
    timeScale: 15
  }).execute();

/*
  new BananaBread.Event({
    onInit: function() {
      this.position = LinearMath.vec3.create([466, 747, 686]);
    },
    onFrame: function(ms) {
      if (0.1*Math.random() < ms/1000) {
        //BananaBread.splash = function(type,          color,    radius, num, fade, p,             size, gravity) {
        BananaBread.splash(BananaBread.PARTICLE.SPARK, 0xAA33FF, 50,    20,   1000,   this.position, 1,   1);
      }
    },
    totalMs: Infinity
  }).run();
*/

  function shootFirework() {
    console.log('shoost!');
    new BananaBread.Effects.Fireworks([{
      position: LinearMath.vec3.create([466, 747, 686+16]),
      velocity: LinearMath.vec3.create([30*(Math.random()-0.5), 30*(Math.random()-0.5), 160 + Math.random()*80]),
      msLeft: 3000.0,
      childMinZ: 686 + 10,
      minVelocityZ: -10,
      childMsLeft: 600,
      size: 1.0
    }]);

    var next = Math.min(Math.random(), Math.random())*1000;
    setTimeout(shootFirework, next);
  }
  shootFirework();
};

Module.loadDefaultMap = function() {
  BananaBread.execute('sleep 10 [ effic md2 ; sleep 20000 [ addbot 50 ] ]');
};

