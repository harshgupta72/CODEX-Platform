import { MongoClient, Db, Collection, ObjectId, type Document } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;
const mem: Record<string, any[]> = {};

function getConfig() {
  const uri = process.env.MONGO_URI || "";
  const dbName = process.env.MONGO_DB || "";
  if (!uri || !dbName) throw new Error("Missing MongoDB environment variables");
  return { uri, dbName };
}

export async function getDb(): Promise<Db> {
  if (db) return db!;
  const { uri, dbName } = getConfig();
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  db = client.db(dbName);
  return db!;
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
  const uri = process.env.MONGO_URI || "";
  const dbName = process.env.MONGO_DB || "";
  if (!uri || !dbName) {
    if (!mem[name]) mem[name] = [];
    const store = mem[name] as T[] & any[];
    const mock: any = {
      find(filter: Record<string, any> = {}) {
        const matches = (doc: any) =>
          Object.keys(filter).every(k => {
            const fv = filter[k];
            const dv = doc[k];
            if (fv instanceof ObjectId && dv instanceof ObjectId) return String(fv) === String(dv);
            return dv === fv;
          });
        let results = store.filter(matches);
        return {
          sort(sortSpec: Record<string, number>) {
            const keys = Object.keys(sortSpec);
            results = results.slice().sort((a, b) => {
              for (const k of keys) {
                const dir = sortSpec[k];
                const av = a[k];
                const bv = b[k];
                if (av === bv) continue;
                if (av == null) return dir === 1 ? 1 : -1;
                if (bv == null) return dir === 1 ? -1 : 1;
                if (av < bv) return dir === 1 ? -1 : 1;
                if (av > bv) return dir === 1 ? 1 : -1;
              }
              return 0;
            });
            return {
              toArray() {
                return Promise.resolve(results.slice());
              }
            };
          },
          toArray() {
            return Promise.resolve(results.slice());
          }
        };
      },
      findOne(filter: Record<string, any>) {
        const rows = store as any[];
        const found = rows.find(d => {
          return Object.keys(filter).every(k => {
            const fv = filter[k];
            const dv = d[k];
            if (fv instanceof ObjectId && dv instanceof ObjectId) return String(fv) === String(dv);
            return dv === fv;
          });
        });
        return Promise.resolve(found || null);
      },
      insertOne(doc: any) {
        const _id = new ObjectId();
        const row = { ...doc, _id };
        store.push(row);
        return Promise.resolve({ insertedId: _id });
      },
      updateOne(filter: Record<string, any>, update: { $set: Record<string, any> }) {
        const rows = store as any[];
        const idx = rows.findIndex(d => {
          return Object.keys(filter).every(k => {
            const fv = filter[k];
            const dv = d[k];
            if (fv instanceof ObjectId && dv instanceof ObjectId) return String(fv) === String(dv);
            return dv === fv;
          });
        });
        if (idx >= 0) {
          rows[idx] = { ...rows[idx], ...(update?.$set || {}) };
          return Promise.resolve({ matchedCount: 1, modifiedCount: 1 });
        }
        return Promise.resolve({ matchedCount: 0, modifiedCount: 0 });
      },
      deleteOne(filter: Record<string, any>) {
        const rows = store as any[];
        const idx = rows.findIndex(d => {
          return Object.keys(filter).every(k => {
            const fv = filter[k];
            const dv = d[k];
            if (fv instanceof ObjectId && dv instanceof ObjectId) return String(fv) === String(dv);
            return dv === fv;
          });
        });
        if (idx >= 0) {
          rows.splice(idx, 1);
          return Promise.resolve({ deletedCount: 1 });
        }
        return Promise.resolve({ deletedCount: 0 });
      }
    };
    return mock as unknown as Collection<T>;
  } else {
    const d = await getDb();
    return d.collection<T>(name);
  }
}
