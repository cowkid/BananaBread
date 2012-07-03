
// Checks for features we cannot run without
// Note: Modify this for your needs. If your level does not use
//       texture compression, remove the check for it here.

(function() {
  function fail(text) {
    text = 'No ' + text + ', halting. A development version of your browser might have this feature (or it might be disabled in your current browser).';
    Module.preRun.push(function() {
      Module._main = null;
      alert(text);
    });
    throw text;
  }
  var canvas = document.createElement('canvas');
  if (!canvas) fail('canvas element');
  var context = canvas.getContext('experimental-webgl');
  if (!context) fail('WebGL');
  var s3tc = context.getExtension('WEBGL_compressed_texture_s3tc') ||
             context.getExtension('MOZ_WEBGL_compressed_texture_s3tc') ||
             context.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');
  if (!s3tc) fail('texture compression');
  var pointerLock = canvas['requestPointerLock'] ||
                    canvas['mozRequestPointerLock'] ||
                    canvas['webkitRequestPointerLock'];
  if (!pointerLock) fail('pointer lock/mouse lock');
})();

// Loading music. Will be stopped once the first frame of the game runs

Module.loadingMusic = new Audio();
Module.loadingMusic.src = 'OutThere_0.ogg';
Module.loadingMusic.play();

// Hooks

Module.postLoadWorld = function() {
  if (Module.loadingMusic) {
    Module.loadingMusic.pause();
    Module.loadingMusic = null;
  }
  Module.tweakDetail();
};

Module.autoexec = function(){}; // called during autoexec on load, so useful to tweak settings that require gl restart
Module.tweakDetail = function(){}; // called from postLoadWorld, so useful to make changes after the map has been loaded

(function() {
  var fraction = 0.75;
  var desired = Math.min(fraction*screen.availWidth, fraction*screen.availHeight, 600);
  var w, h;
  if (screen.width >= screen.height) {
    h = desired;
    w = Math.floor(desired * screen.width / screen.height);
  } else {
    w = desired;
    h = Math.floor(desired * screen.height / screen.width);
  }
  Module.desiredWidth = w;
  Module.desiredHeight = h;
})();

// Public API

var BananaBread = {
  init: function() {
    BananaBread.setPlayerModelInfo = Module.cwrap('_ZN4game18setplayermodelinfoEPKcS1_S1_S1_S1_S1_S1_S1_S1_S1_S1_S1_b', null,
      ['string', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'string', 'number']);
    BananaBread.execute = Module.cwrap('_Z7executePKc', 'number', ['string']);
    BananaBread.executeString = Module.cwrap('_Z10executestrPKc', 'string', ['string']);

    var forceCamera = Module.cwrap('setforcecamera', null, ['number', 'number', 'number', 'number', 'number', 'number']);
    BananaBread.forceCamera = function(position, orientation) {
      forceCamera(position[0], position[1], position[2], orientation[0], orientation[1], orientation[2]);
    };

    BananaBread.PARTICLE = {};
    var i = 0;
    BananaBread.PARTICLE.BLOOD = (i++);
    BananaBread.PARTICLE.WATER = (i++);
    BananaBread.PARTICLE.SMOKE = (i++);
    BananaBread.PARTICLE.STEAM = (i++);
    BananaBread.PARTICLE.FLAME = (i++);
    BananaBread.PARTICLE.FIREBALL1 = (i++);
    BananaBread.PARTICLE.FIREBALL2 = (i++);
    BananaBread.PARTICLE.FIREBALL3 = (i++);
    BananaBread.PARTICLE.STREAK = (i++);
    BananaBread.PARTICLE.LIGHTNING = (i++);
    BananaBread.PARTICLE.EXPLOSION = (i++);
    BananaBread.PARTICLE.EXPLOSION_BLUE = (i++);
    BananaBread.PARTICLE.SPARK = (i++);
    BananaBread.PARTICLE.EDIT = (i++);
    BananaBread.PARTICLE.SNOW = (i++);
    BananaBread.PARTICLE.MUZZLE_FLASH1 = (i++);
    BananaBread.PARTICLE.MUZZLE_FLASH2 = (i++);
    BananaBread.PARTICLE.MUZZLE_FLASH3 = (i++);
    BananaBread.PARTICLE.HUD_ICON = (i++);
    BananaBread.PARTICLE.HUD_ICON_GREY = (i++);
    BananaBread.PARTICLE.TEXT = (i++);
    BananaBread.PARTICLE.METER = (i++);
    BananaBread.PARTICLE.METER_VS = (i++);
    BananaBread.PARTICLE.LENS_FLARE = (i++);
    var splash = Module.cwrap('bb_splash', null, ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']);
    BananaBread.splash = function(type, color, radius, num, fade, p, size, gravity) {
      splash(type, color, radius, num, fade, p[0], p[1], p[2], size, gravity);
    };
  },
};

Module.postRun.push(BananaBread.init);

// Additional APIs

BananaBread.Event = function(data) {
  this.run = function() {
    var start = Date.now();
    var last = start;
    function iteration() {
      var now = Date.now();
      var ms = now - last;
      last = now;
      if (ms > data.totalMs) return;
      data.onFrame(ms);
      Module.requestAnimationFrame(iteration);
    }
    iteration();
  };
  if (data.onInit) data.onInit(data);
}

BananaBread.Effects = {
  Fireworks: function(shots) {
    var event = new BananaBread.Event({
      totalMs: Infinity,

      onFrame: function(ms) {

        var secs = ms/1000;
        var newShots = [];

        shots = shots.filter(function(shot) {
          LinearMath.vec3.add(shot.position, LinearMath.vec3.scale(LinearMath.vec3.create(shot.velocity), secs));
          shot.velocity[2] -= secs * 200; // gravity
          BananaBread.splash(BananaBread.PARTICLE.SPARK, shot.color, 15*shot.size, 70*shot.size, Math.max(50, ms*2), shot.position, 1, 1);
          //Effect.addDynamicLight(shot.position, shot.size*60, shot.color);
          shot.msLeft -= ms;
          if (shot.msLeft > 0 &&
              (!shot.minZ || shot.velocity[2] > 0 || shot.position[2] > shot.minZ) &&
              (!shot.minVelocityZ || shot.velocity[2] > shot.minVelocityZ)) {
            return true;
          } else {
            var num = Math.floor(Math.random()*15*shot.size);
            for (var i = 0; i < num; i++) {
              //Effect.fireball(PARTICLE.EXPLOSION_NO_GLARE, shot.position, shot.size*5, 0.25, shot.color, shot.size*5);
              //Effect.addDynamicLight(shot.position, shot.size*90, shot.color, 0.25, 0.1, 0, 10);
//                        Sound.play("yo_frankie/DeathFlash.wav", shot.position.addNew(new Vector3(0, 0, 10/shot.size)));
              if (shot.size >= 0.6) {
                //Sound.play('olpc/MichaelBierylo/sfx_DoorSlam.wav', shot.position);
              }

              newShots.push({
                position: LinearMath.vec3.create(shot.position),
                velocity: LinearMath.vec3.add(
                  LinearMath.vec3.create(shot.velocity),
                  LinearMath.vec3.create([50*(Math.random()-0.5), 50*(Math.random()-0.5), 50*(Math.random()-0.5)])
                ),
                minZ: shot.childMinZ,
                childMinZ: shot.childMinZ,
                msLeft: shot.childMsLeft*Math.random()*2,
                childMsLeft: shot.childMsLeft*Math.random(),
                color: Math.floor(Math.random()*255) + (Math.floor(Math.random()*255) << 8) + (Math.floor(Math.random()*255) << 16),
                size: shot.size/2.5,
              });
            }
            return false;
          }
        });
      
        shots.push.apply(shots, newShots);

        if (shots.length == 0) this.totalMs = 0;
      },
    });

    event.run();
  }
};

function CameraPath(data) { // TODO: namespace this
  var steps = data.steps;
  var n = data.steps.length;
  var timeScale = data.timeScale;
  var position = LinearMath.vec3.create();
  var temp = LinearMath.vec3.create();
  var orientation = LinearMath.vec3.create();
  var cancelled = false;
  var sigma = data.sigma || 0.75;
  var lasti = -1;
  var debug = data.debug;

  addEventListener('keydown', function() { cancelled = true });

  this.execute = function() {
    var startTime = Date.now();
    function moveCamera() {
      if (cancelled) return;
      var now = Date.now();
      var t = (Date.now() - startTime)/(timeScale*1000);
      if (t > n-1) return;
      var i = Math.round(t);
      if (debug && i != lasti) {
        lasti = i;
        alert('now on ' + i);
        startTime += (Date.now() - now); // ignore alert wait time
      }
      var factors = 0;
      position[0] = position[1] = position[2] = orientation[0] = orientation[1] = orientation[2] = 0;
      for (var j = i-2; j <= i+2; j++) {
        var curr = steps[j];
        if (!curr) continue;
        var factor = Math.exp(-Math.pow((j-t)/sigma, 2));
        LinearMath.vec3.scale(curr.position, factor, temp);
        LinearMath.vec3.add(position, temp);
        LinearMath.vec3.scale(curr.orientation, factor, temp);
        LinearMath.vec3.add(orientation, temp);
        factors += factor;
      }
      LinearMath.vec3.scale(position, 1/factors);
      LinearMath.vec3.scale(orientation, 1/factors);
      BananaBread.forceCamera(position, orientation);
      Module.requestAnimationFrame(moveCamera);
    }
    moveCamera();
  }
}

