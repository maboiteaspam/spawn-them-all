var keypress  = require('keypress')
var debug     = require('debug')('SpawnThemAll')



function Spawners (file) {

  var that = this;
  that.profiles = {};
  that.spawners = {};

  that.addProfile = function (name, opts) {
    that.profiles[name] = opts;
  };

  that.addSpawner = function (name, handler) {
    that.spawners[name] = handler;
  };

  require(file)(this)
}

function Spawned(opt){
  var that = this;

  that.name     = opt.name    || null;
  that.child    = opt.child   || null;
  that.profile  = opt.profile || null;

  that.id       = 'id' in opt     ? opt.id    : null;
  that.index    = 'index' in opt  ? opt.index : null;


  that.pipe = function (stdout, stderr) {
    var child = that.child; var name = that.name;

    debug('pipe %s stdout:%j stderr:%j', name, child && !!child.stdout, child && !!child.stderr)

    that.unpipe(stdout, stderr);

    child && child.stdout && child.stdout.pipe(stdout)
    child && child.stderr && child.stderr.pipe(stderr)
  }
  that.unpipe = function (stdout, stderr) {
    var child = that.child; var name = that.name;

    debug('unpipe %s stdout:%j stderr:%j', name, child && !!child.stdout, child && !!child.stderr)

    child && child.stdout && child.stdout.unpipe(stdout)
    child && child.stderr && child.stderr.unpipe(stderr)
  }
}

function SpawnThemAll (file) {

  var that = this;
  var spawners = new Spawners(file);
  var spawneds = [];

  that.spawners = function (){
    return spawners;
  }

  that.profile = function (profile) {
    if (!(profile in spawners.profiles)) throw  'no such profile '+profile;

    spawners.profiles[profile].forEach(function (spawner) {

      var units = 1
      var name = spawner

      if (!spawner.substr) {
        units = spawner[Object.keys(spawner)[0]].units
        name = Object.keys(spawner)[0]
      }

      for(var k=0;k<units;k++) {
        spawneds.push(new Spawned({
          id:       profile+'-'+name+'-'+k,
          name:     name,
          child:    that.oneOf(name),
          index:    k,
          profile:  profile
        }))
      }

    })
    return spawneds;
  }

  that.oneOf = function (name) {
    if (!name in spawners.spawners) throw  'no such spawner '+name

    return spawners.spawners[name](that)
  }

  that.end = function (done) {
    spawneds.forEach(function (spawned) {
      spawned.child.kill()
    })

    process.nextTick(done)
  }
};

module.exports = SpawnThemAll;
