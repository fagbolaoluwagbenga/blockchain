const redis = require('redis');

const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION"
}

class PubSub {
  constructor({ blockchain, transactionPool, redisUrl }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;

    this.publisher = redis.createClient(redisUrl);
    this.subscriber = redis.createClient(redisUrl);

    this.subscribeToChannels();

    this.subscriber.on('message',
     (channel, message) => this.handleMessage(channel, message)
     );
  }
  handleMessage(channel, message){
    console.log(`Message received. Channel: ${channel}, Message: ${message}.`);

    const parsedMessage = JSON.parse(message);

    switch(channel) {
      case CHANNELS.BLOCKCHAIN: 
       this.blockchain.replaceChain(parsedMessage, true, () => {
        this.transactionPool.clearBlockchainTransactions({
          chain: parsedMessage
        });
       });
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage);
        break;
      default: ``
        return;
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach(channel => {
      this.subscriber.subscribe(channel);
    })
  }

  publish({ channel, message }) {
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    })
  }
}

module.exports = PubSub;











// alternative @ pubnu


// const PubNub = require('pubnub');
// const credentials = {
//   publishKey: 'pub-c-2a3c1513-5b6d-4f96-ad01-e5dab8636faf',
//   subscribeKey: 'sub-c-9070c2b2-d4c8-11ea-bd4f-26a7cd4b6ab5',
//   secretKey: 'sec-c-NTI5Yzg3MDAtMGM3NS00OGE2LWIxYTMtMTc5YmYyM2FkZDc1'
// };

