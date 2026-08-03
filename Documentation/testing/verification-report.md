# Testing seed verification report

Generated: 2026-08-03T14:35:43.763Z

**Result:** PASS (18 passed, 0 failed)

| Check | Result | Detail |
|-------|--------|--------|
| countries_count | pass | 196 |
| national_banks | pass | 199 |
| local_banks | pass | 1364 |
| world_reserve_1b_usdc | pass | 1000000000 |
| national_admins | pass | 197 |
| local_admins | pass | 1360 |
| borrowers_approx_20_per_lb | pass | 27186 (expect ~27280) |
| sample_client_fk_and_hash | pass | client_bangladesh_dhaka_00001 |
| borrower_registered_local_bank | pass |  |
| bangladesh_nb_zero_reserve | pass |  |
| api_health | pass |  |
| login_super_admin_email | pass |  |
| login_super_admin_loginId | pass |  |
| login_national_bangladesh | pass |  |
| login_local_dhaka | pass |  |
| login_client_dhaka_00001 | pass |  |
| hardhat_rpc | pass | 0x7a69 |
| dev_admin_overview_reserve | pass | 1000000000 |

## Counts

- Countries: 196
- National banks: 199
- Local banks: 1364
- National admins: 197
- Local admins: 1360
- Borrowers: 27186
- Users with loginId: 28736
- World reserve (USDC units): 1000000000

## Notes

- Allocation unit for testing is USDC (stored in `InstitutionCapital.reserveEth` / memory `bank.reserve`).
- Oracle/Chainlink may be stale offline; seed does not require live oracle.
- Re-run: `cd backend && npm run db:seed:testing && npm run db:verify:testing`

## Post-verify allocate smoke test

- Super Admin allocated **1,000,000 USDC** to `bank_nb_bangladesh` → World 999M, NB 1M.
- National `bangladesh` allocated **250,000 USDC** to `bank_lb_bangladesh_dhaka` via `/api/banks/allocate` (World→NB→LB chain OK).
- National `/capital/allocate` max raised to 1B USDC for testing.