const { Network } = require('@hyperswarm/network');
const { RPC } = require('@hyperswarm/rpc');

const network = new Network();
const rpc = new RPC(network);

async function main() {
  await network.listen();

  const topicKey = Buffer.from('YOUR_SERVER_TOPIC_KEY_HERE', 'hex'); // Replace with the server's topic key
  const topic = rpc.joinTopic(topicKey);

  const connection = await topic.connect();

  // Make an 'add' request
  const addResult = await connection.request({ method: 'add', args: { a: 5, b: 3 } });
  console.log('Add result:', addResult.result);

  // Make a 'subtract' request
  const subtractResult = await connection.request({ method: 'subtract', args: { a: 10, b: 4 } });
  console.log('Subtract result:', subtractResult.result);
}

main();