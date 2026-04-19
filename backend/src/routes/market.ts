import { Router } from "express";

export const marketRouter = Router();

// Lightweight public endpoint — frontend can also call CoinGecko directly.
// This server proxy exists so the API key (when we move to a paid plan) stays
// out of the browser.
marketRouter.get("/prices", async (_req, res, next) => {
  try {
    const url =
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,matic-network,usd-coin,tether&vs_currencies=usd&include_24hr_change=true";
    const r = await fetch(url);
    if (!r.ok) {
      res.status(502).json({ error: "upstream_failed" });
      return;
    }
    const data = await r.json();
    res.json(data);
  } catch (err) {
    next(err);
  }
});
