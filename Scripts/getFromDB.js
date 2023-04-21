import * as IPFS from "ipfs-core";
import OrbitDB from "orbit-db";

const ipfsOptions = {
  silent: true,
  relay: { enabled: true, hop: { enabled: true, active: true } },
  EXPERIMENTAL: { pubsub: true },
  Addresses: {
    Swarm: [
      '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
      '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
      '/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/'
    ]
  }
};
const ipfs = await IPFS.create(ipfsOptions);

const orbitDBOptions = { directory: "C:\\Users\\cdica\\.orbitdb" };
const orbitdb = await OrbitDB.createInstance(ipfs, orbitDBOptions);

const optionsToWrite = {
  accessController: { write: [orbitdb.identity.id] },
};

async function main() {
  //Init
  const db = await orbitdb.keyvalue("test",optionsToWrite);
  console.log(await ipfs.bootstrap.list())
  console.log(await ipfs.swarm.peers())
  console.log(db.address.toString());
  await db.load();
  //End Init

  if (process.argv[2] == "-a" || process.argv[2] == "-all") {
    console.log(db.all);
    await db.close();
    ipfs.stop();
    return db.all;
  }
  var node_dictionary = {};

  for (let i = 2; i < process.argv.length; i++) {
    if ((await db.get(process.argv[i])) != null) {
      node_dictionary[process.argv[i]] = await db.get(process.argv[i]).values;
    } else {
      node_dictionary[process.argv[i]] = [];
    }
  }
  console.log(node_dictionary);
  await db.close();
  ipfs.stop();
  return node_dictionary;
}

async function _init(){
  
}

function handlePeerConnected(ipfsPeer) {
  const ipfsId = ipfsPeer.id.toB58String();
  if (this.onpeerconnect) this.onpeerconnect(ipfsId);
}

async function connectToPeer(multiaddr, protocol = "/p2p-circuit/ipfs/") {
  try {
    await this.node.swarm.connect(protocol + multiaddr);
  } catch (e) {
    throw e;
  }
}

main();
