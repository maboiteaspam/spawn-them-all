#!/usr/bin/env node

require('console.md')()
var argv = require('minimist')(process.argv.slice(2));

var keypress = require('keypress')
keypress(process.stdin);

if (argv.v) process.env['DEBUG'] = 'SpawnThemAll';

var SpawnThemAll = require('./index.js')
var spawn = new SpawnThemAll('./.spawn');
var debug = require('debug')('SpawnThemAll')

var profile = argv.profile || argv.p;
debug('spawning profile %s', profile);

var spawned = spawn.profile(profile);
var currentFlowed = [];
var currentSpawn = [];
var mode = 'one';

var showMainPage = function () {
  console.mdline('__Menu__: %s', profile)
  console.mdline('* %s - %s ', 'A', 'Menu page')
  spawned.forEach(function (topping, index) {
    console.mdline('* %s - process %s %s',
      String.fromCharCode(index+98).toUpperCase(),
      topping.name,
      topping.index)
  })
}

var pipeChild = function (spawned) {
  var child = spawned.child;
  var name = spawned.name;
  debug('pipe %s stdout:%j stderr:%j', name, child && !!child.stdout, child && !!child.stderr)
  child && child.stdout && child.stdout.pipe(process.stdout)
  child && child.stderr && child.stderr.pipe(process.stderr)
}

var unpipeChild = function (spawned) {
  var child = spawned.child;
  var name = spawned.name;
  debug('unpipe %s stdout:%j stderr:%j', name, child && !!child.stdout, child && !!child.stderr)
  child && child.stdout && child.stdout.unpipe(process.stdout)
  child && child.stderr && child.stderr.unpipe(process.stderr)
}

var switchTo = function (k) {

  debug('switchTo %s', k);

  if (mode==='one') {
    unpipeChild(currentSpawn.unshift())
  } else {
    currentFlowed.push(k)
  }

  if (!spawned[k]) {
    console.error('no process at %s', String.fromCharCode(k+98))
  } else {
    pipeChild(spawned[k])
    currentSpawn.push(spawned[k])
  }

};

process.stdin.on('keypress', function (ch, key) {
// handle ctrl+c
  if (key && key.ctrl && key.name == 'c') {
    spawn.end(function () {
      process.stdin.pause();
    })
  }else if (key && key.ctrl && key.name == 'f') {
    mode = mode==='one'?'flow':'one';
    if (mode==='one') {
      while(currentSpawn.length>1){
        unpipeChild(currentSpawn.shift())
      }
    } else if (mode==='flow') {
      currentFlowed.forEach(switchTo)
    }
    console.log('switched to '+mode)
  }else if (key && key.name == 'a') {
    while(currentSpawn.length>0){
      unpipeChild(currentSpawn.shift())
    }
    currentFlowed = []
    showMainPage();
  }else if (key) {
    var code = key.name.charCodeAt(0) - 98;
    switchTo(code>=0?code:0)
  }
});

if (spawned.length) {
  debug('spawned.length %s', spawned.length)
  showMainPage();
  //var child = spawned[0].child;
  //child.stdout && child.stdout.pipe(process.stdout);
  //child.stderr && child.stderr.pipe(process.stderr);
} else {
  console.error('no process spawned')
  process.exit(0)
}

process.stdin.setRawMode(true);
process.stdin.resume();
