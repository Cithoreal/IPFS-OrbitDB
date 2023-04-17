import * as IPFS from "ipfs-core";
import OrbitDB from "orbit-db";
import fs from "fs";

const ipfs = await IPFS.create();
const options = {directory: 'C:\\Users\\cdica\\.orbitdb'}
const orbitdb = await OrbitDB.createInstance(ipfs, options);


//Linking options

//1 Each node links every following node
//1: Link all nodes to all other nodes
//3: Link each node only to the following node

async function main() {
  const db = await orbitdb.keyvalue("test");
  await db.load();
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
  //console.log(db.all)

  await db.close();
  ipfs.stop();
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch (error) {
    return false;
  }
}
main();
