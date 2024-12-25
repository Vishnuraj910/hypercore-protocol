const Hyperswarm = require('hyperswarm')
const Hyperdrive = require('hyperdrive')
const Hyperbee = require('hyperbee')
const Corestore = require('corestore')
const ram = require('random-access-memory')
const path = require('path')

class FileShareClient {
  constructor(clientId) {
    this.clientId = clientId
    this.swarm = new Hyperswarm()
    this.peers = new Set()
    
    // Initialize corestore
    this.store = new Corestore(`./store-${clientId}`)
    
    // Create core for Hyperbee
    this.core = this.store.get({ name: 'db' })
    this.db = new Hyperbee(this.core, {
      keyEncoding: 'utf-8',
      valueEncoding: 'json'
    })
    
    // Initialize Hyperdrive with corestore
    this.drive = new Hyperdrive(this.store)
  }

  async init() {
    // Wait for store to be ready
    await this.store.ready()
    
    // Wait for core components
    await this.core.ready()
    await this.drive.ready()
    
    console.log(`Client ${this.clientId} initialized with key:`, this.core.key.toString('hex'))

    // Join the swarm
    this.swarm.on('connection', (socket, info) => this.handleConnection(socket, info))
    await this.swarm.join(Buffer.from('shared-file-demo-2024'))

    // Setup replication
    this.swarm.on('connection', (socket) => {
      this.store.replicate(socket)
    })
  }

  async shareFile(fileName, fileContent) {
    try {
      await this.db.put(fileName, fileContent); 
      console.log(`File "${fileName}" shared by ${this.clientId}`); 
    } catch (error) {
      console.error(`Error sharing file "${fileName}":`, error);
    }
  }

  // ... rest of the methods remain the same ...

  async close() {
    await this.swarm.destroy()
    await this.store.close()
  }
}

// Example usage
async function main() {
  // Create three clients
  const clients = []
  for (let i = 1; i <= 3; i++) {
    const client = new FileShareClient(`client-${i}`)
    await client.init()
    clients.push(client)
  }

  // Wait for connections to establish
  await new Promise(resolve => setTimeout(resolve, 2000))

  try {
    // Client 1 shares a file
    // await clients[0].core.shareFile('hello.txt', 'Hello from Client 1!')
    await clients[0].shareFile('hello.txt', 'Hello from Client 1!')
    
    // Wait a bit and let Client 2 update the file
    await new Promise(resolve => setTimeout(resolve, 1000))
    await clients[1].shareFile('hello.txt', 'Hello from Client 2!')
    
    // Wait a bit and let Client 3 read the file
    await new Promise(resolve => setTimeout(resolve, 1000))
    const result = await clients[2].core.readFile('hello.txt')
    console.log('Client 3 reads:', result)
  } catch (error) {
    console.error('Error during file operations:', error)
  }

  // Clean up
  for (const client of clients) {
    await client.close()
  }
}

main().catch(console.error)