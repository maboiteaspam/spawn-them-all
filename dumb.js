require('fs').open('.gitignore', 'r', function (err, fd) {
  var f = process.argv.pop();
  var s = setInterval(function () {
    console.log(f)
  }, 500)
  process.on('SIGINT', function() {
    clearInterval(s)
    fs.close(fd, function () {
      process.exit()
    })
  });
});