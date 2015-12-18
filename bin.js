#!/usr/bin/env node

require('console.md')();

var argv      = require('minimist')(process.argv.slice(2));         if (argv.v) process.env['DEBUG'] = 'SpawnThemAll';
var keypress  = require('keypress')
var Stall     = require('./index.js')
var debug     = require('debug')('SpawnThemAll')



var profile = argv.profile || argv.p;                                debug('spawning profile %s', profile);


var mode    = 'one';
var spawn   = new Stall('./.spawn');
var spawned = spawn.profile(profile);

var currentFlowed = [];
var currentSpawn  = [];


function showMainPage () {

  console.mdline('__Menu__: %s', profile)
  console.mdline('* %s - %s ', 'A', 'Menu page')

  spawned.forEach(function (topping, index) {
    console.mdline('* %s - process %s %s',
      String.fromCharCode(index+98).toUpperCase(),
      topping.name,
      topping.index)
  })

}

function unpipeAll () {
  while(currentSpawn.length>1){
    currentSpawn.shift().unpipe(process.stdout, process.stderr)
  }
}

function showProcessStreams (k) {                                                   debug('showProcessStreams %s', k);

  if (mode==='one' && currentSpawn.length)
    currentSpawn.shift().unpipe(process.stdout, process.stderr)

  if (!spawned[k]) {
    console.error('no process at %s', String.fromCharCode(k+98))

  } else {

    if (mode==='flow') currentFlowed.push(k)

    spawned[k].pipe(process.stdout, process.stderr)
    currentSpawn.push(spawned[k])
  }

}

function switchFlowMode (newMode) {

  mode = newMode

  if (mode==='one') {
    var f = currentSpawn[0] || null;
    unpipeAll()
    f && showProcessStreams(f.index)

  } else if (mode==='flow') {
    currentFlowed.forEach(showProcessStreams)
  }

  console.log('switched to '+mode)

}

function terminateApp () {

  spawn.end(function () {
    process.stdin.pause();
  })

}

function gotoMenu () {

  unpipeAll()
  currentFlowed = []
  showMainPage();

}

keypress(process.stdin);

process.stdin.on('keypress', function (ch, key) {

  if (key && key.ctrl && key.name == 'c') {
    terminateApp()

  }else if (key && key.ctrl && key.name == 'f') {
    mode = switchFlowMode(mode==='one'?'flow':'one')

  }else if (key && key.name == 'a') {
    gotoMenu()

  }else if (key) {
    var code = key.name.charCodeAt(0) - 98;
    showProcessStreams(code<0 ? 0 : code)

  }
});

if (spawned.length) {                                                     debug('spawned.length %s', spawned.length)
  showMainPage();

} else {
  console.error('no process spawned')
  process.exit(0)

}

process.stdin.setRawMode(true);

process.stdin.resume();
