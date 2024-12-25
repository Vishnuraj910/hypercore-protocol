const Hyperdrive = require('hyperdrive')
const Corestore = require('corestore')
const https = require('https');


// Example usage:
async function example() {

  const store = new Corestore('./storage')
  const drive = new Hyperdrive(store)
  
  await drive.put('/blob.txt', Buffer.from('Vishnuraj'))
  const imageUrl = 'https://www.unitedwaydanecounty.org/wp-content/uploads/2023/02/Sample-jpg-image-500kb.jpg'
  await getBufferFromUrl(imageUrl)
  .then(async buffer => {
    // Use the buffer here (e.g., save it to a file)
    console.log('Buffer image received:', buffer);
    await drive.put('/images/online-image.png', Buffer.from(buffer))
  })
  .catch(error => {
    console.error('Error fetching image:', error);
  });
  
  await drive.put('/images/old-logo.png', Buffer.from('..'))
  
  const buffer = await drive.get('/blob.txt')
  console.log("Buffer", buffer.toString()) // => <Buffer ..> "example"
  
  const entry = await drive.entry('/blob.txt')
  console.log("Entry",entry) // => { seq, key, value: { executable, linkname, blob, metadata } }
  
  // await drive.del('/images/old-logo.png')
  
  // await drive.symlink('/images/logo.shortcut', '/images/logo.png')
  
  for await (const file of drive.list('/images')) {
    console.log('list', file) // => { key, value }
  }
  
  const rs = drive.createReadStream('/images/online-image.png')
  for await (const chunk of rs) {
    console.log('rs Stream', chunk.toString()) // => <Buffer ..>
  }
  
  const ws = drive.createWriteStream('/blob.txt')
  ws.write('new example')
  ws.end()
  ws.once('close', () => console.log('file saved'))
}

example().catch(err => {
  console.error('Error:', err)
  process.exit(1) 
})

async function getBufferFromUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}