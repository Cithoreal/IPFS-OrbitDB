import IPFS from 'ipfs'
import OrbitDB from 'orbit-db'

async function main () {
  const ipfsOptions = { repo : './ipfs', }
  const ipfs = await IPFS.create(ipfsOptions)
  const orbitdb = await OrbitDB.createInstance(ipfs)

  // Create / Open a database
  const db = await orbitdb.keyvalue("mind")
  await db.load()

  // Listen for updates from peers
  db.events.on("replicated", address => {
    console.log(db.iterator({ limit: -1 }).collect())
  })

  // Add an entry
 // const hash = await db.add("world")
  
  // Add a key-value entry
  //const hash = await db.put("hello", {name : ["world", "planet"]})
  //db.get("hello").name.push("earth")
  //print the value from the key
   //var updated_array = db.get("hello").name
   //updated_array.push("moon")
  //await db.put("hello", {name : updated_array})
  //console.log(updated_array)
  //console.log(db.set("hello").name.push("moon"))
  var test = db.get("file.txt")
  console.log(test)
  console.log(db.address.toString())
  console.log(db.all)
  //console.log(hash)

  // Query
 // const result = db.iterator({ limit: -1 }).collect()
 // console.log(JSON.stringify(result, null, 2))

 //close the database
  await db.close()

  //stop the ipfs node
 // await ipfs.stop()

}

main()