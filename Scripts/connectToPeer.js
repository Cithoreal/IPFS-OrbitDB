import IPFSOrbitDB from "./IPFSOrbitDB.js";

const ipfsOrbitDB = new IPFSOrbitDB();
ipfsOrbitDB.create();
ipfsOrbitDB.onready = async () => {
    console.log("testing")
  await ipfsOrbitDB.connectToPeer(
    "12D3KooWCy7GVg3yCZogA8c5AHqmSEY2RhNHDembmgeHLJ4kge3u",
    "/ip4/192.168.1.28/tcp/4002/p2p/"
  );
  ipfsOrbitDB.ondbdiscovered = (db) => console.log(db.all);

  ipfsOrbitDB.onpeeronline = console.log;
  //this.onpeernotfound = (e) => {
  //  throw e;
  //};

  ipfsOrbitDB.queryCatalog();
};
