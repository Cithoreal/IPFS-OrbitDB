import * as IPFS from 'ipfs-core'
import OrbitDB from 'orbit-db'

const ipfs = await IPFS.create()
const orbitdb = await OrbitDB.createInstance(ipfs)

async function main () {
    const db = await orbitdb.keyvalue("test1")
    await db.load()
    for (let i = 2; i < process.argv.length; i++) {
        if (await db.get(process.argv[i]) == null) {
            await db.put(process.argv[i], {values: []})
        }
        console.log(process.argv[i])
        for (let j = i; j < process.argv.length; j++) {
            if (i != j) {
                
                var node_values = await db.get(process.argv[i]).values
                if (!node_values.includes(process.argv[j])) {
                    node_values.push(process.argv[j])
                }
                await db.put(process.argv[i], {values : node_values})
                
            }
        }
        
    }
    console.log(db.all)
    await db.close()

}
  
  main()