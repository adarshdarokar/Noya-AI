let cohortchatgptindex;

// Initialize Pinecone client and index
async function initPinecone() {
  const { Pinecone } = await import('@pinecone-database/pinecone');
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

cohortchatgptindex = pc.Index('cohortchatgptindex'); // make sure this index exists
}

initPinecone(); // run once when the service is loaded

// Save a new memory (insert vector into Pinecone)
async function createMemory({ vectors, metadata, messageId }) {
  if (!cohortchatgptindex) throw new Error("Pinecone index not initialized");

  await cohortchatgptindex.upsert([
    {
      id: messageId.toString(),
      values: vectors,
      metadata,
    },
  ]);
}

// Query Pinecone for similar memories
async function queryMemory({ queryVector, limit = 5, metadata }) {
  if (!cohortchatgptindex) throw new Error("Pinecone index not initialized");

  const data = await cohortchatgptindex.query({
    vector: queryVector,
    topK: limit,
    filter: metadata || undefined,
    includeMetadata: true,
  });

  return data.matches;
}

module.exports = { createMemory, queryMemory };
