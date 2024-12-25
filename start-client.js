// start-client.js
const { spawn } = require('child_process')
const path = require('path')

function startClient(id) {
  const client = spawn('node', ['client.js', `client-${id}`], {
    stdio: 'inherit'
  })
  
  client.on('error', (err) => {
    console.error(`Client ${id} error:`, err)
  })
}

// Start multiple clients
for (let i = 1; i <= 3; i++) {
  startClient(i)
}