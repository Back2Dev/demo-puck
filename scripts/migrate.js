const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb://localhost:27017/dive-sites';
const client = new MongoClient(uri);

const DB_PATH = path.join(process.cwd(), 'puck-db.json');

function generateRandomId(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function run() {
  try {
    await client.connect();
    const database = client.db('dive-sites');
    const collection = database.collection('pages');

    if (!fs.existsSync(DB_PATH)) {
      console.log('puck-db.json not found.');
      return;
    }

    const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(fileContent);

    for (const [key, value] of Object.entries(data)) {
      // Check if document with this path already exists
      const existing = await collection.findOne({ path: key });
      
      if (existing) {
        console.log(`Updating existing page: ${key}`);
        await collection.updateOne(
          { path: key },
          { $set: value }
        );
      } else {
        console.log(`Inserting new page: ${key}`);
        const _id = generateRandomId(17);
        // Insert with custom _id
        await collection.insertOne({
          _id: _id,
          path: key,
          ...value
        });
      }
    }

    console.log('Migration completed.');
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
