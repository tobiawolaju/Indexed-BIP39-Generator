import http from "node:http";
import { indexToMnemonic } from "../indexToMnemonic/src/index.js";

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  const index = url.searchParams.get("index");

  if (!index) {
    res.end("Provide ?index=NUMBER");
    return;
  }

  const mnemonic = indexToMnemonic(BigInt(index));

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ mnemonic }));
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
}); 
