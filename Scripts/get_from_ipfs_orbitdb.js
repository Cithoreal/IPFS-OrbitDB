import * as IPFS from 'ipfs-core'
import OrbitDB from "orbit-db";
import ChildProcess from "child_process";
import fs from "fs";

//const ipfs = new IPFS({ host: 'localhost', port: '5001', protocol: 'http' })

const ipfs = await IPFS.create();
const orbitdb = await OrbitDB.createInstance(ipfs);

async function main() {
  const fileName = process.argv[2];
  const hash = await getFromOrbitDB(fileName);

  console.log(hash);
  //Get file from ipfs and save it to disk
  const stream = ipfs.cat(hash);
  const decoder = new TextDecoder();
  let data = "";

  for await (const chunk of stream) {
    // chunks of data are returned as a Uint8Array, convert it back to a string
    data += decoder.decode(chunk, { stream: true });
  }

  //save to file
  //var encryptedFileContent = value.value.toString('utf8')
  fs.writeFile("encrypted.bin", data, (err) => {
    if (err) {
      console.log(err);
    }
    console.log("File saved");
    decryptFile(fileName);
    ipfs.stop();
  });
}

async function getFromOrbitDB(fileName) {
  const db = await orbitdb.keyvalue("mind");
  await db.load();
  //console.log(fileName)
  const hash = db.get(fileName);

  await db.close();

  return hash;
}

function decryptFile(fileName) {
  const scriptPath = "encryption.py";

  const options = {
    stdio: ["pipe", "inherit", "inherit"],
    shell: true,
  };

  const subprocess = ChildProcess.spawn(
    "venv\\Scripts\\python.exe",
    [scriptPath, "-d", fileName],
    options
  );
}

main();
