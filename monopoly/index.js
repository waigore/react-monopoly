/*
import http from 'http';

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
*/


import { PropertyColor, BoardTile, PropertyTile } from './core/BoardTile';
import {MonopolyGame} from './core/MonopolyGame';

var m = new MonopolyGame({b:'b'});
console.log(m.a, m.b);

var b = new BoardTile({name: 'Old Kent Road'});
console.log(b.name);

var c = PropertyColor.BROWN;
console.log(c);


var tile = PropertyTile({
  name: 'Old Kent Road',
  pos: {row: 1, seq: 1},
  color: PropertyColor.BROWN
});

console.log(tile.name, tile.pos, tile.color);
