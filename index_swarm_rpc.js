const network = require('@hyperswarm/network')()

const RPC = require('@hyperswarm/rpc')

const rpc = new RPC(network);

async function main() {
  await network.listen();

  const topic = await rpc.createTopic('my-service');

  topic.on('connection', (connection) => {
    console.log('New client connected');

    connection.on('request', async (request) => {
      console.log('Received request:', request);

      if (request.method === 'add') {
        const { a, b } = request.args;
        const result = a + b;
        await connection.respond({ result });
      } else if (request.method === 'subtract') {
        const { a, b } = request.args;
        const result = a - b;
        await connection.respond({ result });
      } else {
        await connection.respond({ error: 'Method not found' });
      }
    });
  });

  console.log('Server listening on:', topic.key.toString('hex'));
}

main();