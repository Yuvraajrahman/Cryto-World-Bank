# Crypto World Bank — Full Entity Catalogue

Reference archive extracted from `Pre-thesis_v35.tex` (§3.5 Data Model).
The thesis main body uses a trimmed summary; this file preserves the full 51-entity descriptions for later use.

**Schema totals:** 31 core + 6 extension + 14 stubs = **51 logical entities** (+ 2 Phase IV platform tables).

## Core entities — Part A: lending and client

| Entity | Primary key | Role / description |
|--------|-------------|-------------------|
| INSTITUTION | `institution_id` | Shared supertype for all banking-tier identities. Attributes: `institution_type` `ENUM('WORLD','NATIONAL','LOCAL')`, `name`, `wallet_address`, `contract_address`, `status`, `created_at`. All multi-entity tables (`INTERBANK_LOAN`, `NETTING_ENTRY`, …) reference this PK for enforceable cross-tier FKs. |
| COUNTRY | `country_code` | ISO 3166-1 alpha-2 reference (PK). Attributes: `name`, `default_stablecoin_symbol`, `regulatory_regime_tag`. |
| WORLD_BANK | `institution_id` | Subtype of `INSTITUTION` (`institution_type='WORLD'`); PK is also FK → `INSTITUTION`. Singleton enforced: `CHECK (institution_id = 1)` plus no-delete trigger. Global reserve parameters; on-chain binding: `chain_id`, `last_synced_block`, `deployment_tx_hash`. |
| NATIONAL_BANK | `institution_id` | Subtype of `INSTITUTION` (`institution_type='NATIONAL'`); FK `country_code` → `COUNTRY` with `UNIQUE` (one national reserve per nation). FK `parent_world_bank_id` → `WORLD_BANK`. |
| LOCAL_BANK | `institution_id` | Subtype of `INSTITUTION` (`institution_type='LOCAL'`); FK `national_bank_id` → `NATIONAL_BANK`. City-level banks lending to retail clients. |
| BANK_USER | `bank_user_id` | Bank staff with role-based permissions. `bank_type` `ENUM('world','national','local')`; nullable FKs `world_bank_id`, `national_bank_id`, `local_bank_id` with CHECK enforcing exactly one parent institution. |
| BORROWER | `borrower_id` | End borrowers (UK: `wallet_address`). FK `registered_local_bank_id` → `LOCAL_BANK` (NOT NULL, set at onboarding). KYC attributes (off-chain, hash-only at MVT): `kyc_level` `ENUM(0--3)`, `kyc_document_hash` (SHA-256 of government ID; no raw PII), `kyc_verified_at`, `kyc_expiry`. Level 2+ income documents stored in `INCOME_PROOF`. `LOAN_REQUEST` remains the separate M:N association for banks at which the client has applied. |
| LOAN_REQUEST | `request_id` | Loan applications and approval workflow. `status` (lifecycle): `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `DISBURSED`, `CANCELLED`. `oracle_state` (event-listener only): `NONE`, `COMMIT_PENDING`, `COMMITTED`, `SCORE_REVEALED`; `DON_REQUESTED` reserved for Chainlink Functions upgrade (Future Work). FKs: `submission_event_log_id`, `approval_event_log_id`; `on_chain_request_id`. |
| LOAN | `loan_id` | Active loan after disbursement; FK `loan_request_id` → `LOAN_REQUEST`; collateral and loan asset references. `on_chain_loan_id`, `disbursement_event_log_id`. |
| INSTALLMENT | `loan_id`, `installment_number` | Repayment schedule (weak entity on `LOAN`; composite PK). `payment_event_log_id`, `payment_tx_hash`. |
| TRANSACTION | `transaction_id` | Financial ledger records for retail and institutional flows. `transaction_type` (`LOAN_DISBURSEMENT`, `INSTALLMENT_PAYMENT`, `INTERBANK_TRANSFER`, `UPWARD_DEPOSIT`, `TREASURY_SWAP`, …), `direction` (`CREDIT`/`DEBIT`). Nullable FKs: `borrower_id` → `BORROWER` (retail flows); `origin_institution_id`, `counterparty_institution_id` → `INSTITUTION` (institution-to-institution flows). CHECK: at least one actor side is non-null. `blockchain_tx_hash`, `event_log_id`. |
| BORROWING_LIMIT | `limit_id` | Per-borrower limits with 6-month and 1-year rolling windows (UK: `borrower_id`). `last_computed_at`, `last_synced_block`, `on_chain_enforced_limit`, `sync_discrepancy_flag`. Authoritative enforcement remains on-chain. |
| CREDIT_PASSPORT | `passport_id` | Read-model projection of on-chain CreditPassport SBT events (event-listener owned). FK `borrower_id`; `wallet_address`, `on_chain_token_id`, `credit_score`, `risk_tier`, `open_loans`, `total_defaults`, `kyc_level`, `last_score_updated_at`, `last_updated_block`, `chain_id`. |

## Core entities — Part B: auxiliary, analytics, profile

| Entity | Primary key | Role / description |
|--------|-------------|-------------------|
| INCOME_PROOF | `proof_id` | Level 2+ income and bank-statement verification (multi-valued per borrower). FK `borrower_id` → `BORROWER`. Stores `document_type`, `sha256_hash` (no raw file at MVT), `status`, `reviewed_by` → `BANK_USER`. Government-ID hashes for Level 1 KYC live on `BORROWER.kyc_document_hash`; ZKP credential workflow uses `KYC_VERIFICATION_REQUEST` (Future Work). |
| CHAT_MESSAGE | `message_id` | Human-to-human client↔bank messages in the loan workflow. FK to `LOAN_REQUEST` and/or `LOAN`. Not agent-specific; not for inter-tier authority communication (see `INSTITUTION_MESSAGE`). |
| INSTITUTION_MESSAGE | `message_id` | Cross-tier / cross-authority communication audit trail. FK `sender_institution_id`, `receiver_institution_id` → `INSTITUTION`; `message_type` (`SAR_ESCALATION`, `SYNDICATION_INVITE`, `RESERVE_ALERT`, `IBLP_REQUEST`, …), `payload` (JSONB), `status`, `created_at`, `read_at`. |
| AGENT_CONVERSATION_TURN | `turn_id` | Each turn of the Qwen3-8B agent conversation (Phase III). FK `session_id` → `SESSIONS`. Stores `role` (user/assistant/system), `content_summary`, `tokens_used`, `tool_calls` (JSONB). Separate from `AGENT_ACTION_LOG` (write-tool execution only). |
| MODEL_REGISTRY | `model_id` | ML model lineage for audit and explainability. Attributes: `model_name`, `version`, `training_date`, `metrics` (JSONB), `artifact_hash`, `is_active`. Referenced by `LOAN_RISK_ASSESSMENT`. |
| LOAN_RISK_ASSESSMENT | `assessment_id` | Per-loan ML inference record: FK `loan_request_id` → `LOAN_REQUEST`; FK `model_id` → `MODEL_REGISTRY`; `fraud_probability`, `anomaly_score`, `shap_vector` (JSONB), `feature_vector_hash`, `created_at`. |
| SECURITY_EVENT_LOG | `event_id` | System-wide security and AML events (append-only). Attributes: `event_type`, `actor_id`, `actor_type`, `severity`, `payload` (JSONB), `created_at`. INSERT-only RLS policy; distinct from per-loan `LOAN_RISK_ASSESSMENT`. |
| MARKET_DATA | `market_data_id` | Non-Chainlink price cache (e.g.\ CoinGecko fallback). Read-only auxiliary; no FK into core lending. Key attributes: `symbol`, `price_usd`, `source`, `recorded_at`. Chainlink rounds are stored in `CHAINLINK_PRICE_ROUND`. |
| CHAINLINK_PRICE_ROUND | `round_id` | Chainlink `AggregatorV3Interface` round cache: `feed_address`, `pair_symbol`, `answer`, `round_id_on_chain`, `answered_in_round`, `updated_at`, `chain_id`. Required for staleness check (`answeredInRound` < `roundId`). |
| PROFILE_SETTING | `profile_id` | Interface preferences for borrowers and bank staff. Nullable FKs: `borrower_id` → `BORROWER`; `bank_user_id` → `BANK_USER`. CHECK: exactly one FK is non-null. Attributes: `language_setting`, `display_currency`, `notification_enabled`. |
| CREDIT_PASSPORT_HISTORY | `history_id` | Append-only audit trail of `CREDIT_PASSPORT` score and tier changes (event-listener owned). |
| COLLATERAL_POSITION | `position_id` | Event-listener-owned projection of on-chain collateral lock state. FK `borrower_id` → `BORROWER`; FK `loan_id` → `LOAN`; FK `asset_id` → `ASSETS`. Attributes: `locked_amount`, `lock_tx_hash`, `liquidation_threshold`, `last_synced_block`, `chain_id`. READ-ONLY for Express API; written exclusively by event listener (RLS enforced). |
| BLOCKCHAIN_EVENT_LOG | `event_id` | Canonical off-chain cache of on-chain event receipts. Populated exclusively by the event listener. Attributes: `contract_address`, `event_name`, `tx_hash` (UNIQUE), `block_number`, `log_index`, `chain_id`, `raw_data` (JSONB), `recorded_at`. Referenced by FK from `LOAN_REQUEST`, `LOAN`, and `INSTALLMENT` for audit linkage. |
| AUDIT_LOGS | `audit_id` | General-purpose append-only event log for governance and compliance events not covered by `AGENT_ACTION_LOG`. Attributes: `event_type`, `actor_id`, `actor_type`, `payload` (JSONB), `created_at`. INSERT-only RLS policy. |

## Core entities — Part C: agent session and reference

| Entity | Primary key | Role / description |
|--------|-------------|-------------------|
| SESSIONS | `session_id` | Wallet session registry for the **retail-client** conversational agent (Phase III Must): FK `borrower_id` → `BORROWER`; device/IP hash, EIP-7702 session-key scope and TTL, parent lineage, compression summary, end reason. Bank-authority agent sessions (`actor_type='BANK_USER'`) are Future Work. Phase II: `SESSION_ANCESTOR` closure table. |
| AGENT_ACTION_LOG | `action_id` | Append-only agent write-tool log (`session_id`, `tool_name`, `parameters`, `confirmation_turn_id`, `onchain_tx_hash`, `status`). Separate from `AGENT_CONVERSATION_TURN`; INSERT-only RLS policy. |
| INTEREST_RATE_TIER | `tier_id` | Normalised kinked-rate parameters (`base_rate`, `kink_utilisation`, `rate_above_kink`, `max_rate`). Discriminator: `bank_tier_type` `ENUM('world','national','local')`. Temporal validity: `effective_from`, `effective_to`, `governance_proposal_id`, `superseded_by`, `is_active`. Partial unique: `(bank_tier_type) WHERE is_active = TRUE`. |
| ASSETS | `asset_id` | Collateral and loan asset registry (UK: `symbol`); referenced by `LOAN` via `collateral_asset_id` and `loan_asset_id`. |

## Extension entities (Phase II–III)

| Entity | Primary key | Role / description |
|--------|-------------|-------------------|
| GROUP_CONSENT | `consent_id` | Per-member multi-signature consent for `GroupLendingPool` (UK: `loan_request_id`, `member_id`). `consent_tx_hash`, `event_log_id`. |
| TRANCHED_POOL_SUBSCRIPTION | `subscription_id` | Investor tranche positions: `pool_id`, `subscriber_id`, `subscriber_type`, `tranche` (`SENIOR`/`JUNIOR`), `committed_amount`, `subscription_tx_hash`. |
| NETTING_COORDINATOR_STATE | `batch_id` | Off-chain Settlement Coordinator state: `status` (`COMPUTING` → `SETTLED`), `gross_obligations`, `net_settlements` (JSONB), `challenge_deadline`, `on_chain_batch_id`. |
| KYC_VERIFICATION_REQUEST | `request_id` | ZKP KYC workflow tracker: `borrower_id`, `kyc_level_requested`, `status`, `credential_hash`, `proof_hash`, `on_chain_tx_hash`. |
| ORACLE_HEARTBEAT_MONITOR | `monitor_id` | Chainlink feed staleness monitor: `feed_address`, `pair_symbol`, `expected_heartbeat_seconds`, `last_round_id`, `is_stale`, `chain_id`. |
| SESSION_ANCESTOR | `session_id`, `ancestor_id` | Closure table for session lineage (replaces recursive INSERT trigger). `depth` (1 = direct parent). |

## Extended banking and multi-entity stubs (Phase II–III)

| Entity | Primary key | Role / description |
|--------|-------------|-------------------|
| SAVINGS_ACCOUNT | `account_id` | SavingsVault deposit account. FK `borrower_id` → `BORROWER`; FK `local_bank_id` → `LOCAL_BANK(institution_id)`. `on_chain_address`, `balance`, `last_synced_block`. |
| FIXED_DEPOSIT | `deposit_id` | FixedDeposit term product. FK `borrower_id`; FK `local_bank_id` → `LOCAL_BANK(institution_id)`. `principal`, `maturity_date`, `on_chain_address`. |
| CURRENT_ACCOUNT | `ca_id` | Transactional account. FK `borrower_id`; FK `local_bank_id` → `LOCAL_BANK(institution_id)`. `balance`, `on_chain_address`. |
| LOAN_GROUP | `group_id` | GroupLendingPool on-chain group. FK `local_bank_id` → `LOCAL_BANK(institution_id)`. `on_chain_group_id`, `max_members`, `status`. |
| GROUP_MEMBER | `member_id` | Weak entity on `LOAN_GROUP`. FK `group_id`; FK `borrower_id`. `joined_at`, `consent_tx_hash`. |
| INSURANCE_FUND | `fund_id` | InsuranceFund reserve tracker. FK `local_bank_id` → `LOCAL_BANK(institution_id)`. `balance`, `on_chain_address`, `last_synced_block`. |
| INTERBANK_LOAN | `ib_loan_id` | IBLP same-tier liquidity loan. FK `lender_institution_id`, `borrower_institution_id` → `INSTITUTION`; trigger/CHECK enforces matching `institution_type` per pool instance (`IBLP_NB` or `IBLP_LB`). `tenor_days`, `amount`, `status`, `on_chain_tx_hash`. |
| UPWARD_DEPOSIT | `ud_id` | UpwardDepositFacility surplus deposit. FK `depositor_institution_id`, `parent_institution_id` → `INSTITUTION`; CHECK enforces adjacent tier-pair (Local→National or National→World). `amount`, `rate`, `on_chain_tx_hash`. |
| SYNDICATE | `syndicate_id` | SyndicatedLoan deal header. FK `lead_institution_id` → `INSTITUTION`; FK `borrower_id` → `BORROWER`. `total_amount`, `status`, `on_chain_address`. |
| SYNDICATE_MEMBER | `syndicate_id`, `member_institution_id` | Co-lender position. FK `member_institution_id` → `INSTITUTION`. `committed_amount`, `share_bps`, `consent_tx_hash`. |
| TRANCHED_POOL | `pool_id` | TranchedPool deal header. FK `sponsor_institution_id` → `INSTITUTION`. `senior_target`, `junior_target`, `status`, `on_chain_address`. |
| TREASURY_SWAP | `swap_id` | TreasurySwap record. FK `initiator_institution_id` → `INSTITUTION`. `from_asset_id`, `to_asset_id`, `amount_from`, `amount_to`, `swap_tx_hash`. |
| NETTING_BATCH | `batch_id` | NettingEngine settlement batch header. `gross_obligations` (JSONB), `status`, `on_chain_batch_id`. |
| NETTING_ENTRY | `entry_id` | Individual net position per institution per batch. FK `batch_id` → `NETTING_BATCH`; FK `participant_institution_id` → `INSTITUTION`. `net_amount`, `settled_tx_hash`. |

## Implementation tiers (all 51 entities)

| Entity | Bucket | Tier | Notes |
|--------|--------|------|-------|
| *Phase I (M1) --- Gate G1: 13 tables migrated* | | | |
| INSTITUTION, COUNTRY, WORLD_BANK, NATIONAL_BANK, LOCAL_BANK | Core | M1 | Institution hierarchy + supertype |
| BANK_USER, BORROWER | Core | M1 | Staff + retail client; `kyc_level` on `BORROWER` |
| LOAN_REQUEST, LOAN, INSTALLMENT | Core | M1 | Lending lifecycle (loan tables may be empty at G1) |
| BLOCKCHAIN_EVENT_LOG, ASSETS, AUDIT_LOGS | Core | M1 | Event sync, asset registry, governance audit |
| *Phase II (M2) --- lending completion + one product path* | | | |
| TRANSACTION, BORROWING_LIMIT, CREDIT_PASSPORT | Core | M2 | Ledger + on-chain limit projection |
| CREDIT_PASSPORT_HISTORY, INCOME_PROOF | Core | M2 | SBT history; Level 2+ document hashes |
| INTEREST_RATE_TIER | Core | M2 | Should; kinked-rate UI |
| GROUP_CONSENT, LOAN_GROUP, GROUP_MEMBER | Ext./Stub | M2 | If `GroupLendingPool` demo chosen |
| INTERBANK_LOAN, UPWARD_DEPOSIT | Stub | M2 | Should; one multi-entity PoC |
| SAVINGS_ACCOUNT | Stub | M2 | Should; if `SavingsVault` deployed |
| *Phase III (M3) --- ML oracle + agent* | | | |
| MODEL_REGISTRY, LOAN_RISK_ASSESSMENT | Core | M3 | MVT items 4--8 |
| SECURITY_EVENT_LOG | Core | M3 | Should; SAR workflow |
| SESSIONS, AGENT_ACTION_LOG, AGENT_CONVERSATION_TURN | Core | M3 | MVT item 11 |
| SESSION_ANCESTOR | Ext. | M3 | Should; session lineage |
| *Stub --- ERD documented; migrate when matching contract ships* | | | |
| FIXED_DEPOSIT, CURRENT_ACCOUNT, INSURANCE_FUND | Stub | Stub | Deposit / risk-buffer products |
| SYNDICATE, SYNDICATE_MEMBER, TRANCHED_POOL | Stub | Stub | Phase III stretch / Future Work impl. |
| TREASURY_SWAP, NETTING_BATCH, NETTING_ENTRY | Stub | Stub | `NettingEngine` is Future Work |
| TRANCHED_POOL_SUBSCRIPTION | Ext. | Stub | Paired with `TranchedPool` |
| *Future --- specified; no MVT physical migration* | | | |
| CHAT_MESSAGE, INSTITUTION_MESSAGE, PROFILE_SETTING | Core | Future | UX / inter-tier messaging |
| MARKET_DATA, CHAINLINK_PRICE_ROUND, ORACLE_HEARTBEAT_MONITOR | Core/Ext. | Future | Mock oracles at MVT; real feeds later |
| COLLATERAL_POSITION | Core | Future | Liquidation module |
| KYC_VERIFICATION_REQUEST, NETTING_COORDINATOR_STATE | Ext. | Future | ZKP KYC; multilateral netting |
| CHAIN_REGISTRY, SESSION_KEY_PERMISSION | --- | Future | Platform config; outside 51-entity count |

## Audit and logging taxonomy

| Table | Writer | Scope | Typical contents |
|-------|--------|-------|------------------|
| `BLOCKCHAIN_EVENT_LOG` | Event listener | On-chain receipts | `tx_hash`, `event_name`, `raw_data`; FK target for `LOAN_REQUEST`, `LOAN`, `INSTALLMENT` |
| `LOAN_RISK_ASSESSMENT` | FastAPI ML service | Per-loan inference | `fraud_probability`, `shap_vector`, FK `model_id` → `MODEL_REGISTRY` |
| `AUDIT_LOGS` | Express API | Governance / compliance | Travel Rule packets, role grants, manual approver actions |
| `SECURITY_EVENT_LOG` | ML / monitoring | System-wide security | AML alerts, anomaly spikes, agent injection blocks |
| `AGENT_ACTION_LOG` | Express agent hooks | Agent write tools | `tool_name`, `confirmation_turn_id`, `onchain_tx_hash` |

## Platform-configuration relations (outside 51-entity count)

| Entity | Role |
|--------|------|
| `CHAIN_REGISTRY` | Deployment chain IDs, RPC endpoints, EIP-7702 delegation contract addresses (Phase IV). |
| `SESSION_KEY_PERMISSION` | Normalised MCP tool allowlists per session (Phase IV). |

## Notes

- Extended banking entities include planned on-chain anchor fields `on_chain_address` and `last_synced_block` for event-listener mapping.
- Multi-entity stub FKs anchor to `INSTITUTION.institution_id` rather than tier-specific PK namespaces.
- Gate G1 requires the 13 M1 tables only; stub and Future entities remain in the ERD for design completeness.
- **BORROWER:** prototype uses `BORROWER`/`borrower_id`; final migration may rename to `CLIENT`/`client_id`. `UNIQUE(wallet_address)` assumes single-chain Sepolia demo; Phase IV may adopt `(wallet_address, chain_id)` for multi-chain.