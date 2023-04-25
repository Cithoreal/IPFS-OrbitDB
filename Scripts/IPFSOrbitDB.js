import * as IPFS_CORE from "ipfs-core";
import orbitdb from "orbit-db";
import fs from "fs";
import { multiaddr } from "@multiformats/multiaddr";

import net from "net";

//Create IPFS
class IPFSOrbitDB {
  constructor() {
    this.OrbitDB = orbitdb;
    this.Ipfs = IPFS_CORE;
  }

  async create() {
    this.node = await this.Ipfs.create({
      //silent: true,

      EXPERIMENTAL: { pubsub: true },
      repo: "./ipfs",
      config: {},
    });

    this.orbitdb = await this.OrbitDB.createInstance(this.node);
    console.log("IPFS and OrbitDB running....");
    this._initDBs();

    const port = 5000;

    const server = net.createServer((socket) => {
      console.log("Client connected");

      socket.on("data", async (data) => {
        //console.log('Received: ${data}');

        data = data.toString().split(",");
        // var result = "Hey you"
        console.log(data);
        //socket.write('Received: ' + data);

        if (data[0] == "get") {
          var result = await this.getFromDB(data.slice(1));
          console.log(result.toString());
          socket.write(result.toString());
        }
      });

      socket.on("end", () => {
        console.log("Client disconnected");
      });

      socket.on("error", (error) => {
        console.log(`Socket Error: ${error.message}`);
      });
    });

    server.on("error", (error) => {
      console.log(`Server Error: ${error.message}`);
    });

    server.listen(port, () => {
      console.log(`TCP socket server is running on port: ${port}`);
    });


  }

  async _initDBs() {
    const nodeInfo = await this.node.id();

    // differences between older apis which use publicKey are causing problems.
    this.defaultOptions = {
      accessController: { write: [this.orbitdb.identity.id] },
    };
    // console.log(this.orbitdb.identity.id)

    this.thoughtDictDB = await this.orbitdb.keyvalue(
      "ThoughtDictionary",
      this.defaultOptions
    );
    await this.thoughtDictDB.load();
    //console.log(this.thoughtDictDB.id)
    //this.thoughtDictDB.set("test", "test")
    this.user = await this.orbitdb.keyvalue("user", this.defaultOptions);
    await this.user.load();
    //console.log(this.user.id)
    //console.log(this.user.all)
    //console.log(this.thoughtDictDB.all)
    //await this.user.set("ThoughtDictionary", this.thoughtDictDB.id);
    // console.log(this.user.all)

    this.peers = await this.orbitdb.keyvalue("peers", this.defaultOptions);
    await this.peers.load();
    //console.log(this.peers.id)

    await this.loadFixtureData({
      username: Math.floor(Math.random() * 1000000).toString(),
      ThoughtDictionary: this.thoughtDictDB.id,
      nodeId: nodeInfo.id.toString(),
    });

    // console.log(this.peers.all)
    //console.log(this.peers.id)
    //node.libp2p.addEventListener('peer:connect', (evt) => {
    //  console.log('Connection established to:', evt.detail.remotePeer.toString())	// Emitted when a new connection has been created
    //})
    //node.libp2p.addEventListener("peer:connect", (evt) => { this.handlePeerConnected(evt.detail)})
    await this.node.pubsub.subscribe(
      nodeInfo.id.toString(),
      this.handleMessageReceived.bind(this)
    );
    /*
    this.peerConnectionInterval = setInterval(
      this.connectToPeers.bind(this),
      10000
    );
    this.connectToPeers();*/

    // when the OrbitDB docstore has loaded, intercept this method to
    // carry out further operations.
    this.onready();
  }

  async addToDB(thoughts) {
    var nodes = [];
    //Check each value to see if it is a file or not
    //Add file conent ids to the value array
    for (let i = 1; i < thoughts.length; i++) {
      nodes.push(thoughts[i]);
      if (this.fileExists(thoughts[i])) {
        console.log("adding file to ipfs");
        const file = await ipfs.add({
          path: thoughts[i],
          content: fs.createReadStream(thoughts[i]),
        });
        await ipfs.pin.add(file.cid);
        //console.log(file.cid.toString())
        nodes.push(thoughts[i].substring(0, thoughts[i].indexOf(".")));
        nodes.push(thoughts[i].substring(thoughts[i].indexOf(".")));
        nodes.push(file.cid.toString());
        //console.log(nodes)
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      if ((await this.thoughtDictDB.get(nodes[i])) == null) {
        await this.thoughtDictDB.put(nodes[i], { values: [] });
      }
    }
    if (thoughts[0] == "-1" || thoughts[0] == "-2") {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i; j < nodes.length; j++) {
          if (i != j) {
            var node_values = await this.thoughtDictDB.get(nodes[i]).values;
            if (!node_values.includes(nodes[j])) {
              node_values.push(nodes[j]);
            }
            await this.thoughtDictDB.put(nodes[i], { values: node_values });
          }
        }
      }
    }
    if (thoughts[0] == "-2") {
      for (let i = nodes.length - 1; i >= 0; i--) {
        for (let j = i; j >= 0; j--) {
          if (i != j) {
            var node_values = await this.thoughtDictDB.get(nodes[i]).values;
            if (!node_values.includes(nodes[j])) {
              node_values.push(nodes[j]);
            }
            await this.thoughtDictDB.put(nodes[i], { values: node_values });
          }
        }
      }
    }
    if (thoughts[0] == "-3") {
      for (let i = 0; i < nodes.length; i++) {
        if (i != nodes.length - 1) {
          var node_values = await this.thoughtDictDB.get(nodes[i]).values;
          if (!node_values.includes(nodes[i + 1])) {
            node_values.push(nodes[i + 1]);
          }
          await this.thoughtDictDB.put(nodes[i], { values: node_values });
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
  
  async getFromDB(thoughts) {
    let toString = obj => Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(', ');
    if (thoughts[0] == "-a" || thoughts[0] == "-all") {
      var all = toString(this.thoughtDictDB.all)
      return all;
    }
    var node_dictionary = {};

    for (let i = 0; i < thoughts.length; i++) {
      if ((await this.thoughtDictDB.get(thoughts[i])) != null) {
        node_dictionary[thoughts[i]] = await this.thoughtDictDB.get(thoughts[i])
          .values;
      } else {
        node_dictionary[thoughts[i]] = [];
      }
    }

    console.log(node_dictionary);
    // await this.thoughtDictDB.close();

    return toString(node_dictionary);
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
      if (!this.user.get(key))
        await this.user.set(key.toString(), fixtureData[key].toString());
    }
  }

  async getIpfsPeers() {
    const peers = await this.node.swarm.peers();
    return peers;
  }

  async connectToPeer(address, protocol = "") {
    // var peerId = PeerId(address);
    // console.log(peerId)
    var addr = multiaddr(protocol + address);
    console.log("attempt connect to peer");
    console.log(addr);
    try {
      await this.node.swarm.connect(addr);
      console.log("connected to peer");
      var peers = await this.node.swarm.peers();
      this.handlePeerConnected(address);
    } catch (e) {
      throw e;
    }
  }

  handlePeerConnected(ipfsPeer) {
    console.log("Handle Peer Connected " + ipfsPeer);
    //const ipfsId = ipfsPeer.id._idB58String;

    setTimeout(async () => {
      //console.log({ user: this.user.id })
      await this.sendMessage(ipfsPeer, { user: this.user.id });
    }, 2000);

    if (this.onpeerconnect) this.onpeerconnect(ipfsId);
  }

  async handleMessageReceived(msg) {
    console.log("Handle Message Received");
    console.log(msg);
    console.log(parsedMsg)
    const parsedMsg = JSON.parse(msg.data.toString());
    const msgKeys = Object.keys(parsedMsg);
    console.log(msgKeys)
    console.log(msgKeys[0])
    switch (msgKeys[0]) {
      case "user":
        console.log(parsedMsg.user)
        console.log(await this.orbitdb.open(parsedMsg.user))
        var peer = await this.orbitdb.open(parsedMsg.user);
        peer.events.on("replicated", async () => {
          console.log("replicated")
          if (peer.get("ThoughtDictionary")) {
            console.log(peer.get("ThoughtDictionary"))
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
      console.log("send message " + topic + " " + messageBuffer);
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
    const peerIds = Object.values(this.peers.all).map((peer) => peer.nodeId);
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
    console.log("Querying catalog...");
    const peerIndex = this.peers.all;

    const dbAddrs = Object.keys(peerIndex).map(
      (key) => peerIndex[key].ThoughtDictionary
    );

    const allThoughts = await Promise.all(
      dbAddrs.map(async (addr) => {
        console.log("map");
        console.log(addr);
        const db = await this.orbitdb.open(addr);
        console.log("opened");
        await db.load();
        console.log("loaded");
        console.log(db.all);
        return db.get("");
      })
    );

    return allThoughts.reduce((flatThoughts, thoughts) => {
      thoughts.forEach((p) => flatThoughts.push(p));
      return flatPieces;
    }, this.thoughtDictDB.get(""));
  }
}

//var node = new IPFSOrbitDB();
//await node.create();

export default IPFSOrbitDB;
