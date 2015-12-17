# spawn-them-all

cli node module to provide an interface to better control output of multiple spawned child process.

## Install

    npm i maboiteaspam/spawn-them-all -g

## Command line

```sh
    spawn-them-all is a node binary.

    spawn-them-all -p|--profile [profile of child to spawn]
    spawn-them-all -v [verbose mode]
```

## Usage

Create a file on the `cwd`

__.spawn__
```js
var spawn = require('child_process').spawn;

module.exports = function (spawners) {
  spawners.addSpawner('pate', function () {
    return spawn('node', ['dumb.js', 'pate'], {stdio:'pipe'})
  })
  spawners.addSpawner('basilic', function () {
    return spawn('node', ['dumb.js', 'basilic'], {stdio:'pipe'})
  })
  spawners.addSpawner('tomate', function () {
    return spawn('node', ['dumb.js', 'tomate'], {stdio:'pipe'})
  })
  spawners.addSpawner('salami', function () {
    return spawn('node', ['dumb.js', 'salami'], {stdio:'pipe'})
  })
  spawners.addProfile('pizza', [
    'pate',                 // need only 1
    {'basilic':{units:2}},  // a bit of basil
    {'salami':{units:3}},   // a bit of salami
    {'tomate':{units:4}},   // more tomatoes for the sauce
  ])
};
```

Invoke `spawn-them-all` with `pizza` profile.

```sh
spawn-them-all -p pizza
```

A menu appears to you, it let you select which process you d prefer to listen to,

```sh
Menu: pizza

    * A - Menu page
    * B - process pate 0
    * C - process basilic 0
    * D - process basilic 1
    * E - process salami 0
    * F - process salami 1
    * G - process salami 2
    * H - process tomate 0
    * I - process tomate 1
    * J - process tomate 2
    * K - process tomate 3
```

Press `b`, to switch to process `pate{0}`,

```sh
pate
pate
...
```

press `d` to switch to process `D{1}`.

```sh
basilic
basilic
...
```

press `ctrl+f` to enter `flow` mode, where you can listen multiple process at same time.


press `d`, then `b`,

```sh
basilic
pate
basilic
pate
...
```

press `ctrl+f` again to leave `flow` mode.



## Read More

- https://github.com/maboiteaspam/spawn-them-all/blob/master/.spawn
- https://github.com/TooTallNate/keypress
- https://github.com/rvagg/through2
- https://github.com/nodejs/readable-stream/blob/master/doc/stream.markdown#stream_event_data
- https://github.com/substack/stream-handbook
- https://github.com/maboiteaspam/working-with-streams


## Develop

```js
git clone git@github.com:maboiteaspam/spawn-them-all.git
cd spawn-them-all
npm link . --local
```
