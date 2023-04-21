import * as IPFS_CORE from "ipfs-core";
import orbitdb from "orbit-db";
import fs from "fs";
//Create IPFS
class IPFSOrbitDB {

  constructor () {
    this.OrbitDB = orbitdb
    this.Ipfs = IPFS_CORE
  }

  async create() {

    this.node = await this.Ipfs.create({
      EXPERIMENTAL: { pubsub: true },
      relay: { enabled: true, hop: { enabled: true, active: true } },
      Discovery: {
        MDNS: {
          Enabled: false
        }
      }
    });

    this._init();
  }

  async _init() {

    const nodeInfo = await this.node.id();
    this.orbitdb = await this.OrbitDB.createInstance(this.node, {directory: "C:\\Users\\cdica\\.orbitdb"});
    // differences between older apis which use publicKey are causing problems.
    this.defaultOptions = {
      accessController: { write: [this.orbitdb.identity.id] },
    };

    const kvStoreOptions = {
      ...this.defaultOptions,
    };

    this.thoughtDictDB = await this.orbitdb.keyvalue(
      "ThoughtDictionary",
      kvStoreOptions
    );
    await this.thoughtDictDB.load();
    //console.log(await this.node.bootstrap.list())
    //console.log(await this.node.swarm.localAddrs())
    //console.log(await this.node.swarm.addrs());
   // console.log(await this.node.swarm.peers())
    this.user = await this.orbitdb.kvstore("user", this.defaultOptions);
    await this.user.load();
    await this.user.set("ThoughtDictionary", this.thoughtDictDB.id);

    await this.loadFixtureData({
      username: Math.floor(Math.random() * 1000000),
      ThoughtDictionary: this.thoughtDictDB.id,
      nodeId: nodeInfo.id,
    });

    this.peers = await this.orbitdb.keyvalue("peers", this.defaultOptions);
    await this.peers.load();

    this.node.libp2p.addEventListener("peer:connect", (evt) => { this.handlePeerConnected.bind(this)}) 
    await this.node.pubsub.subscribe(
      nodeInfo.id.toString(),
      this.handleMessageReceived.bind(this)
    );

    this.peerConnectionInterval = setInterval(
      this.connectToPeers.bind(this),
      10000
    );
    this.connectToPeers();

    // when the OrbitDB docstore has loaded, intercept this method to
    // carry out further operations.
   // this.onready();
  }

  async onready() {
    await this.connectToPeer("12D3KooWGNNm7qG3TWk3ZmoDHf4UsKqaW7YbCJTMe664734iqzAN");
    ondbdiscovered = (db) => console.log(db.all);

    onpeeronline = console.log;
    onpeernotfound = () => {
      throw e;
    };

    queryCatalog();
  }

  async addToDB() {
    var nodes = [];
    //Check each value to see if it is a file or not
    //Add file conent ids to the value array
    for (let i = 3; i < process.argv.length; i++) {
      nodes.push(process.argv[i]);
      if (fileExists(process.argv[i])) {
        console.log("adding file to ipfs");
        const file = await ipfs.add({
          path: process.argv[i],
          content: fs.createReadStream(process.argv[i]),
        });
        await ipfs.pin.add(file.cid);
        //console.log(file.cid.toString())
        nodes.push(process.argv[i].substring(0, process.argv[i].indexOf(".")));
        nodes.push(process.argv[i].substring(process.argv[i].indexOf(".")));
        nodes.push(file.cid.toString());
        //console.log(nodes)
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      if ((await db.get(nodes[i])) == null) {
        await db.put(nodes[i], { values: [] });
      }
    }
    if (process.argv[2] == "-1" || process.argv[2] == "-2") {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i; j < nodes.length; j++) {
          if (i != j) {
            var node_values = await db.get(nodes[i]).values;
            if (!node_values.includes(nodes[j])) {
              node_values.push(nodes[j]);
            }
            await db.put(nodes[i], { values: node_values });
          }
        }
      }
    }
    if (process.argv[2] == "-2") {
      for (let i = nodes.length - 1; i >= 0; i--) {
        for (let j = i; j >= 0; j--) {
          if (i != j) {
            var node_values = await db.get(nodes[i]).values;
            if (!node_values.includes(nodes[j])) {
              node_values.push(nodes[j]);
            }
            await db.put(nodes[i], { values: node_values });
          }
        }
      }
    }
    if (process.argv[2] == "-3") {
      for (let i = 0; i < nodes.length; i++) {
        if (i != nodes.length - 1) {
          var node_values = await db.get(nodes[i]).values;
          if (!node_values.includes(nodes[i + 1])) {
            node_values.push(nodes[i + 1]);
          }
          await db.put(nodes[i], { values: node_values });
        }
      }
    }
  }

  fileExists(filePath) {
    try {
      fs.accessSync(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFromDB() {
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

  async getAllFromDB() {}

  async deleteProfileField(key) {
    const cid = await this.user.del(key);
    return cid;
  }

  getAllProfileFields() {
    return this.user.all;
  }

  getProfileField(key) {
    return this.user.get(key);
  }

  async updateProfileField(key, value) {
    const cid = await this.user.set(key, value);
    return cid;
  }

  async loadFixtureData(fixtureData) {
    const fixtureKeys = Object.keys(fixtureData);

    for (let i in fixtureKeys) {
      let key = fixtureKeys[i];

      if (!this.user.get(key)) await this.user.set(key, fixtureData[key]);
    }
  }

  async getIpfsPeers() {
    const peers = await this.node.swarm.peers();
    return peers;
  }

  async connectToPeer(multiaddr, protocol = "/dnsaddr/bootstrap.libp2p.io/p2p/") {
    console.log("attempt connect to peer");
    console.log(protocol + multiaddr);
    try {
      await this.node.swarm.connect(protocol + multiaddr);
    } catch (e) {
      throw e;
    }
  }

  handlePeerConnected(ipfsPeer) {
    const ipfsId = ipfsPeer.id._idB58String;

    setTimeout(async () => {
      await this.sendMessage(ipfsId, { user: this.user.id });
    }, 2000);

    if (this.onpeerconnect) this.onpeerconnect(ipfsId);
  }

  async handleMessageReceived(msg) {
    const parsedMsg = JSON.parse(msg.data.toString());
    const msgKeys = Object.keys(parsedMsg);

    switch (msgKeys[0]) {
      case "user":
        var peer = await this.orbitdb.open(parsedMsg.user);
        peer.events.on("replicated", async () => {
          if (peer.get("ThoughtDictionary")) {
            await this.peers.set(peer.id, peer.all);
            this.ondbdiscovered && this.ondbdiscovered(peer);
          }
        });
        break;
      default:
        break;
    }

    if (this.onmessage) this.onmessage(msg);
  }

  async sendMessage(topic, message, callback) {
    try {
      const msgString = JSON.stringify(message);
      const messageBuffer = this.getBuffer().from(msgString);
      await this.node.pubsub.publish(topic, messageBuffer);
    } catch (e) {
      throw e;
    }
  }

  getBuffer() {
    return typeof Buffer === "undefined" ? Ipfs.Buffer : Buffer;
  }

  getPeers() {
    return this.peers.all;
  }

  async connectToPeers() {
    const peerIds = Object.values(this.peers.all).map(
      (peer) => peer.nodeId
    );
    const connectedPeerIds = await this.getIpfsPeers();
    peerIds.forEach(async (peerId) => {
      if (connectedPeerIds.indexOf(peerId) !== -1) return;
      try {
        await this.connectToPeer(peerId);
        this.onpeeronline && this.onpeeronline();
      } catch (e) {
        this.onpeernotfound && this.onpeernotfound();
      }
    });
  }

  async queryCatalog() {
    const peerIndex = NPP.peers.all();
    const dbAddrs = Object.keys(peerIndex).map((key) => peerIndex[key].pieces);

    const allPieces = await Promise.all(
      dbAddrs.map(async (addr) => {
        const db = await this.orbitdb.open(addr);
        await db.load();

        return db.get("");
      })
    );

    return allPieces.reduce((flatPieces, pieces) => {
      pieces.forEach((p) => flatPieces.push(p));
      return flatPieces;
    }, this.pieces.get(""));
  }
}

var node = new IPFSOrbitDB();
await node.create();

