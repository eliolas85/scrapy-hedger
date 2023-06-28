const WebSocket = require("ws");
const wss = new WebSocket.Server({ noServer: true });

function getUnifiedData(wss) {
  let unifiedData = {};
  let buffer = {};

  wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
      let parsedMessage = JSON.parse(message);
      let key = parsedMessage.broker + ":" + parsedMessage.symbol;

      buffer[key] = {
        ...parsedMessage,
        updatedAt: new Date().toISOString(),
      };
    });
  });

  setInterval(() => {
    unifiedData = { ...unifiedData, ...buffer };
    buffer = {};
  }, 1000); // 5 minuti in millisecondi);

  return { unifiedData, buffer };
}

module.exports = getUnifiedData;
