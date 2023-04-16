import * as IPFS from "ipfs-core";
import OrbitDB from "orbit-db";
import fs from "fs";

const ipfs = await IPFS.create();
const orbitdb = await OrbitDB.createInstance(ipfs);

async function main() {
  const db = await orbitdb.keyvalue("test3");
  await db.load();
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

main();
