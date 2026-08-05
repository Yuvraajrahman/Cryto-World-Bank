/**
 * @deprecated JSON store kept only for type re-exports during transition.
 * Runtime source of truth: `../db/clientDeposits` (Postgres).
 */
export {
  VAULT_APY_BPS,
  YIELD_SPLIT,
  FD_TERMS,
  EARLY_PENALTY_BPS,
  RESERVE_RATIO_BPS,
  RESERVE_MIN_BPS,
  RESERVE_RATIO_OK,
  USD_USDC_RATE,
  CLIENT_FX_USDC_PER_ETH,
  CLIENT_FX_SPREAD_BPS,
  estimateAccruedYield,
} from "../db/clientDeposits";
