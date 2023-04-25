import IPFSOrbitDB from "./IPFSOrbitDB.js";

const ipfsOrbitDB = new IPFSOrbitDB();
ipfsOrbitDB.create();
ipfsOrbitDB.onready = async () => {
  var arr = process.argv.slice(2)
  console.log(arr)
  await ipfsOrbitDB.addToDB(arr)
};