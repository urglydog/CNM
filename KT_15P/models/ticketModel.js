const {
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { dynamoDb } = require("../aws");

const tableName = process.env.DYNAMODB_TABLE_NAME || "EventTickets";

async function listTickets({ query = "", status = "" }) {
  const command = new ScanCommand({
    TableName: tableName,
  });

  const result = await dynamoDb.send(command);
  let items = result.Items || [];

  if (query) {
    const keyword = query.toLowerCase();
    items = items.filter((ticket) => {
      const eventName = String(ticket.eventName || "").toLowerCase();
      const holderName = String(ticket.holderName || "").toLowerCase();
      return eventName.includes(keyword) || holderName.includes(keyword);
    });
  }

  if (status) {
    items = items.filter((ticket) => ticket.status === status);
  }

  return items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function getTicketById(ticketId) {
  const command = new GetCommand({
    TableName: tableName,
    Key: { ticketId },
  });

  const result = await dynamoDb.send(command);
  return result.Item || null;
}

async function createTicket(ticket) {
  const command = new PutCommand({
    TableName: tableName,
    Item: ticket,
  });

  await dynamoDb.send(command);
  return ticket;
}

async function updateTicket(ticket) {
  const command = new PutCommand({
    TableName: tableName,
    Item: ticket,
  });

  await dynamoDb.send(command);
  return ticket;
}

async function deleteTicket(ticketId) {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: { ticketId },
  });

  await dynamoDb.send(command);
}

module.exports = {
  listTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
};
