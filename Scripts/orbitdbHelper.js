import * as IPFS from "ipfs-core";
import OrbitDB from "orbit-db";

// Create IPFS and OrbitDB instances
// implement the options for ipfs and orbitdb to be publicly accessible by peers who know the address
const ipfsOptions = {
    silent: true,
    relay: { enabled: true, hop: { enabled: true, active: true } },
    EXPERIMENTAL: { pubsub: true },
};
const ipfs = await IPFS.create(ipfsOptions);

const orbitDBOptions = { directory: "C:\\Users\\cdica\\.orbitdb" };
const orbitdb = await OrbitDB.createInstance(ipfs, orbitDBOptions);

const optionsToWrite = {
    accessController: { write: [this.orbitdb.identity.id] },
};

// Create a database
const db = await orbitdb.keyvalue(
    "/orbitdb/zdpuArKn6PMgYLBivinUC76bD1e5yLHpou1pnR6SwvqcLau9m/test",
    optionsToWrite
);

// Load the database
await db.load();

// Subscribe to updates
db.events.on("replicated", (address) => {
    console.log(db.iterator({ limit: -1 }).collect());
}
);

// Add an entry
const hash = await db.put("hello", "world");

// Query
const result = db.get("hello");

console.log(result);

// Close / stop everything
await db.close();
await orbitdb.stop();
await ipfs.stop();
