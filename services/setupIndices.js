const client = require("./elasticsearch");

async function createEmailIndex() {
  const exists = await client.indices.exists({ index: "emails" });
 
  if (!exists) {
    await client.indices.create({
      index: "emails",
      body: {
        mappings: {
          properties: {
            user_id: { type: "keyword" },
            email_id: { type: "keyword" },
            subject: { type: "text" },
            sender: { type: "keyword" },
            recipient: { type: "keyword" },
            date: { type: "date" },
            content: { type: "text" },
          },
        },
      },
    });
    console.log("Emails index created successfully");
  } else {
    console.log("Emails index already exists");
  }
}

async function createMailboxIndex() {
  const exists = await client.indices.exists({ index: "mailboxes" });

  if (!exists) {
    await client.indices.create({
      index: "mailboxes",
      body: {
        mappings: {
          properties: {
            user_id: { type: "keyword" },
            folder_name: { type: "keyword" },
            email_count: { type: "integer" },
          },
        },
      },
    });
    console.log("Mailboxes index created successfully");
  } else {
    console.log("Mailboxes index already exists");
  }
}

async function setupIndices() {
  try {
    await createEmailIndex();
    await createMailboxIndex();
  } catch (error) {
    console.error("Error setting up indices:", error);
  }
}

module.exports = setupIndices;
