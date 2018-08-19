const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function * a() {
  let counter = 1;

  while (true) {
    let newVal = yield counter;
    counter = newVal;
  }


}

var gen = a();

//console.log(gen.next().value);
//console.log(gen.next(2).value);
//console.log(gen.next(3).value);

function askForInput(val) {
  console.log('Counter =' + val + '.');
  rl.question('Press enter a value to continue, or q to quit: ', (answer) => {
    if (answer == 'q') {
      rl.close();
    }
    else {
      //gen.next(parseInt(answer));
      askForInput(gen.next(parseInt(answer)).value);
    }
  })
}

askForInput(gen.next().value);
