// UserService.js
const dbService = require("./dbService");
const axios = require("axios");
const client = require("./elasticsearch");

const UserService = {
  async getUserById(id) {
    return await dbService.findOne("users", { id });
  },

  async createUser(outlookId, name, email) {
    return await dbService.create("users", {
      outlook_id: outlookId,
      name,
      email,
    });
  },

  async updateUserEmail(id, email) {
    return await dbService.update("users", { email }, { id });
  },

  async deleteUser(id) {
    return await dbService.delete("users", { id });
  },

  async findOrCreateUser(outlookId, name, email) {
    return await dbService.findOrCreate(
      "users",
      { outlook_id: outlookId },
      { name, email }
    );
  },

  async syncEmails(accessToken, userId) {
    const fetchAllMessages = async (accessToken) => {
      let messages = [];
      let nextLink = "https://outlook.office.com/api/v2.0/me/messages?$top=100"; // Initial request URL with pagination

      while (nextLink) {
        const response = await axios.get(nextLink, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = response.data;
        messages = messages.concat(data.value); // Add the current batch of messages

        nextLink = data["@odata.nextLink"]; // Get the next link, if available
      }

      return messages;
    };
    try {
      const [emails, mailboxesResponse] = await Promise.all([
        fetchAllMessages(accessToken),
        axios.get("https://outlook.office.com/api/v2.0/me/mailFolders", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const mailboxes = mailboxesResponse.data;

      mailboxes.value.forEach(async (mailbox) => {
        await client.index({
          index: "mailboxes",
          id: mailbox.Id,
          body: {
            user_id: userId,
            folder_name: mailbox.DisplayName,
            email_count: mailbox.TotalItemCount,
          },
        });
      });

      // delete all user emails before updating new data
      await client.deleteByQuery({
        index: "emails",
        query: {
          match: {
            user_id: userId,
          },
        },
      });

      emails.forEach(async (email) => {
        await client.index({
          index: "emails",
          id: email.Id,
          body: {
            user_id: userId,
            email_id: email.Id,
            subject: email.Subject,
            sender: email.From.EmailAddress.Address,
            recipient: email.ToRecipients.map(
              (r) => r.EmailAddress.Address
            ).join(", "),
            date: email.DateTimeReceived,
            content: email.Body.Content,
            mailbox_id: email.ParentFolderId,
          },
        });
      });
    } catch (error) {
      console.error("Error syncing emails:", error);
    }
  },

  async getEmails(userId) {
    try {
      const [emails, mailboxes] = await Promise.all([
        client.search({
          index: "emails",
          body: {
            query: {
              match: {
                user_id: userId,
              },
            },
          },
        }),
        client.search({
          index: "mailboxes",
          body: {
            query: {
              match: {
                user_id: userId,
              },
            },
          },
        }),
      ]);

      // make an object with mailbox id as key and body as value
      const mailboxMap = mailboxes.hits.hits.reduce((acc, curr) => {
        acc[curr._id] = { ...curr._source, emails: [] };
        return acc;
      }, {});

      emails.hits.hits.map((email) => {
        const mailbox = mailboxMap[email._source.mailbox_id];
        mailbox.emails.push(email._source);
      });

      // return the object with folder_name as key instead of _id
      // To make it easier to read on the frontend
      const result = Object.values(mailboxMap).reduce((result, current) => {
        result[current.folder_name] = current;
        return result;
      }, {});

      return result;
    } catch (error) {
      console.error("Error retrieving emails:", error);
    }
  },
};

module.exports = UserService;
