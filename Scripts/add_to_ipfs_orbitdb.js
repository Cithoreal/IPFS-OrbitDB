import * as IPFS from 'ipfs-core'
import OrbitDB from 'orbit-db'
import ChildProcess from 'child_process'
import fs from 'fs'

//const ipfs = new IPFS({ host: 'localhost', port: '5001', protocol: 'http' })

const ipfs = await IPFS.create()
const orbitdb = await OrbitDB.createInstance(ipfs)


async function main () {
    const fileName = process.argv[2];
    encryptFile(fileName)
    const hash = await addToIPFS("encrypted.bin")
    await addHashToDB(fileName,hash)

    ipfs.stop()
    console.log("All done")
    //close()
}

function encryptFile(fileName) {
  const scriptPath = 'encryption.py'

  const options = {
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true
  }

  const subprocess = ChildProcess.spawnSync('venv\\Scripts\\python.exe', [scriptPath, "-e", fileName], options)

  if (subprocess.status !== 0) {
    console.log('Failed to encrypt file')
    process.exit(1)
  }
  console.log("done encrypting")
}

async function addToIPFS(filePath) {
  console.log("add to ipfs")
  const file = await ipfs.add({
    path: filePath,
    content: fs.createReadStream(filePath)
  })
  //pin the file to the local node
  await ipfs.pin.add(file.cid)
  console.log(file.cid.toString())
  return file.cid.toString()
}


async function addHashToDB(fileName, hash) {

  const db = await orbitdb.keyvalue("mind")
  await db.load()
  //console.log(hash)
  await db.put(fileName, hash)

  await db.close()
}

main()

// Further goals:
// Pass in any kind of data to be encrypted and added to IPFS
// Data can be a file or a string
// Recieve any number of arguments, each argument is the key with the arguments following it being the value
