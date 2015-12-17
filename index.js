var keypress = require('keypress')
var through2 = require('through2')
var debug = require('debug')('SpawnThemAll')



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
        var spawned = {
          id:       profile+'-'+name+'-'+k,
          name:     name,
          child:    that.oneOf(name),
          index:    k,
          profile:  profile
        };
        spawneds.push(spawned)
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