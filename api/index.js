import http from "node:http";
import { indexToMnemonic, MAX_INDEX } from "../indexToMnemonic/src/index.js";

const PAGE_SIZE = 1000;
const MAX_PAGE = Number(MAX_INDEX / BigInt(PAGE_SIZE));

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
    return;
  }

  if (url.pathname === "/") {
    const index = url.searchParams.get("index");

    if (!index) {
      sendJson(res, 400, { error: "Provide ?index=NUMBER" });
      return;
    }

    try {
      const mnemonic = indexToMnemonic(BigInt(index));

      sendJson(res, 200, {
        index,
        mnemonic,
        balanceEth: "0.000000"
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }

    return;
  }

  if (url.pathname === "/page") {
    const pageParam = url.searchParams.get("page") ?? "1";
    const page = Number(pageParam);

    if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE + 1) {
      sendJson(res, 400, {
        error: `Provide ?page=NUMBER between 1 and ${MAX_PAGE + 1}`
      });
      return;
    }

    const startIndex = BigInt((page - 1) * PAGE_SIZE);
    const rows = [];

    for (let offset = 0; offset < PAGE_SIZE; offset += 1) {
      const index = startIndex + BigInt(offset);
      if (index > MAX_INDEX) {
        break;
      }

      const mnemonic = indexToMnemonic(index);
      rows.push({
        index: index.toString(),
        mnemonic,
        balanceEth: "0.000000"
      });
    }

    sendJson(res, 200, {
      page,
      pageSize: PAGE_SIZE,
      totalPages: MAX_PAGE + 1,
      rows
    });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
