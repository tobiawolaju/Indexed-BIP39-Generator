import { indexToMnemonic } from "../indexToMnemonic/src/index";

export default function handler(req, res) {
  const { index } = req.query;

  if (!index) {
    return res.status(400).json({ error: "index required" });
  }

  try {
    const mnemonic = indexToMnemonic(BigInt(index));
    res.status(200).json({ mnemonic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

