const Hypercore = require("hypercore");
const Hyperbee = require('hyperbee')

async function main() {
  const core = new Hypercore("./my-db", {
    valueEncoding: 'json'  // or 'utf-8' depending on your data
  });
  await core.append("Hello World");
  await core.ready();

  for (let i = 0; i < core.length; i++) {
    const data = await core.get(i);
    if (data && data.deletedIndex !== undefined) {
      console.log(`Entry at index ${data.deletedIndex} is marked as deleted.`);
    } else if (data) {
      console.log(`Entry at index ${i}: ${data}`);
    }
  }

  core.close();




  const db = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8'
  })
  await db.put('name', 'Vishnuraj Rajagopal')
  const value = await db.get('name')


  console.log(value); // Hello World
}

main();
