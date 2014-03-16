importScripts('ai.js', 'grid.js', 'tile.js')

var ai, grid
var score = 0
var won = false

self.addEventListener('message', function(e) {
  var data = e.data
  switch(data.cmd) {
  case 'setup':
    grid = new Grid(data.size);
    var state = data.state

    for(var i = 0; i < data.size; i++) {
      for(var j = 0; j < data.size; j++) {
        var s
        if((s = state.cells[i][j]) !== null) {
          var tile = new Tile({x: s.x, y: s.y}, s.value)
          grid.cells[i][j] = tile
        }
      }
    }

    ai = new AI(grid)
    self.postMessage({cmd: 'setup', ok: true, state: grid.cells})
    break
  case 'best':
    if(ai === undefined) {
      return self.postMessage({cmd: 'best', ok: false})
    }

    if(won) {
      return self.postMessage({cmd: 'best', ok: true, won: true})
    }

    var best = ai.getBest()
    var result = grid.move(best.move)

    if(result.won) {
      won = true;
    }

    return self.postMessage({cmd: 'best', ok: true, best: best.move})
  case 'move':
    var t = data.tile
    var tile = new Tile({x: t.x, y: t.y}, t.value)

    grid.insertTile(tile)
    grid.playerTurn = true

    self.postMessage({cmd: 'move', ok: true})

    break
  default:
    self.postMessage('unknown cmd = ' + data.cmd)
    break
  }
}, false)