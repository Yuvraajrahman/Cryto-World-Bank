import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import toast from "react-hot-toast";
import {
  PiggyBank,
  Users,
  ArrowLeftRight,
  RefreshCw,
  Landmark,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";
import {
  contractAddresses,
  savingsVaultAbi,
  groupLendingAbi,
  interBankAbi,
  mockUsdcAbi,
} from "@/lib/contracts";
import { contractsConfigured } from "@/lib/onChain";
import { useOnChainTx } from "@/hooks/useOnChainTx";

export function Facilities() {
  const role = useSession((s) => s.role);
  const { address, isConnected } = useAccount();
  const onChain = contractsConfigured();
  const { write, busy } = useOnChainTx(() => load());

  const [savingsAmount, setSavingsAmount] = useState("0.05");
  const [savingsBalance, setSavingsBalance] = useState("0");
  const [savingsShares, setSavingsShares] = useState("0");
  const [withdrawShares, setWithdrawShares] = useState("");
  const [musdcMintAmount, setMusdcMintAmount] = useState("1000");
  const [groups, setGroups] = useState<unknown[]>([]);
  const [iblpLoans, setIblpLoans] = useState<unknown[]>([]);
  const [upward, setUpward] = useState<unknown[]>([]);
  const [memberWallet, setMemberWallet] = useState("");
  const [groupId, setGroupId] = useState("1");
  const [iblpBorrower, setIblpBorrower] = useState("");
  const [iblpAmount, setIblpAmount] = useState("0.05");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      if (address) {
        const s = await api
          .get<{ onChain: { balanceEth: string; shares: string } }>(`/api/phase2/savings/${address}`)
          .catch(() => null);
        setSavingsBalance(s?.onChain?.balanceEth ?? "0");
        setSavingsShares(s?.onChain?.shares ?? "0");
        if (!withdrawShares && s?.onChain?.shares) setWithdrawShares(s.onChain.shares);
      }
      const g = await api.get<{ onChain: unknown[] }>("/api/phase2/groups").catch(() => ({ onChain: [] }));
      setGroups(g.onChain ?? []);
      const ib = await api
        .get<{ onChain: unknown[] }>(
          iblpBorrower
            ? `/api/phase2/interbank/loans?borrower=${iblpBorrower}`
            : "/api/phase2/interbank/loans",
        )
        .catch(() => ({ onChain: [] }));
      setIblpLoans(ib.onChain ?? []);
      const u = await api.get<{ deposits: unknown[] }>("/api/phase2/upward-deposits").catch(() => ({ deposits: [] }));
      setUpward(u.deposits ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  function depositSavings() {
    if (!isConnected || !contractAddresses.savingsVault) {
      toast.error("Connect wallet and run phase2:local");
      return;
    }
    const assets = parseEther(savingsAmount);
    write({
      address: contractAddresses.savingsVault,
      abi: savingsVaultAbi,
      functionName: "deposit",
      args: [assets],
      value: assets,
    } as unknown as Parameters<typeof write>[0]);
  }

  function createGroup() {
    if (!contractAddresses.groupLendingPool || !contractAddresses.localBank) return;
    write({
      address: contractAddresses.groupLendingPool,
      abi: groupLendingAbi,
      functionName: "createGroup",
      args: [contractAddresses.localBank],
    });
  }

  function addGroupMember() {
    if (!contractAddresses.groupLendingPool || !memberWallet) return;
    write({
      address: contractAddresses.groupLendingPool,
      abi: groupLendingAbi,
      functionName: "addMember",
      args: [BigInt(groupId), memberWallet as `0x${string}`],
    });
  }

  function consentGroup() {
    if (!contractAddresses.groupLendingPool) return;
    write({
      address: contractAddresses.groupLendingPool,
      abi: groupLendingAbi,
      functionName: "recordConsent",
      args: [BigInt(groupId)],
    });
  }

  function withdrawSavings() {
    if (!isConnected || !contractAddresses.savingsVault || !withdrawShares) {
      toast.error("Enter shares to withdraw");
      return;
    }
    write({
      address: contractAddresses.savingsVault,
      abi: savingsVaultAbi,
      functionName: "withdraw",
      args: [BigInt(withdrawShares)],
    });
  }

  function mintMusdc() {
    if (!isConnected || !contractAddresses.mockUsdc || !address) {
      toast.error("Connect wallet (world governor / minter)");
      return;
    }
    const amount = BigInt(Math.floor(Number(musdcMintAmount) * 1_000_000));
    write({
      address: contractAddresses.mockUsdc,
      abi: mockUsdcAbi,
      functionName: "mint",
      args: [address, amount],
    });
  }

  function iblpRepay(loanId: string, principalEth: string, tenorDays: number) {
    if (!contractAddresses.interBankLendingPool || !isConnected) return;
    const principal = parseEther(principalEth);
    const interest = (principal * 400n * BigInt(tenorDays)) / (10000n * 365n);
    const owed = principal + interest;
    write({
      address: contractAddresses.interBankLendingPool,
      abi: interBankAbi,
      functionName: "repay",
      args: [BigInt(loanId)],
      value: owed,
    } as unknown as Parameters<typeof write>[0]);
  }

  function iblpBorrow() {
    if (!contractAddresses.interBankLendingPool || !iblpBorrower) return;
    const principal = parseEther(iblpAmount);
    write({
      address: contractAddresses.interBankLendingPool,
      abi: interBankAbi,
      functionName: "borrow",
      args: [iblpBorrower as `0x${string}`, principal, 7],
      value: principal,
    } as unknown as Parameters<typeof write>[0]);
  }

  const canManageGroup =
    role === "LOCAL_BANK_ADMIN" || role === "OWNER" || role === "APPROVER";
  const canIblp =
    role === "NATIONAL_BANK_ADMIN" || role === "LOCAL_BANK_ADMIN" || role === "OWNER";

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Phase II"
        title="Banking Facilities"
        description="Savings vault, group lending pools, interbank liquidity, and upward funding history."
        right={
          <button className="btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {!onChain ? (
        <div className="card p-6 text-sm text-amber-200">
          Run <code className="font-mono">npm run phase2:local</code> and restart the frontend.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-gold-400" />
            <div className="font-display text-lg font-semibold text-ink-100">Savings Vault</div>
          </div>
          <p className="text-sm text-ink-200">ETH savings with simplified yield accrual.</p>
          <div className="stat">
            <div className="stat-label">Your balance</div>
            <div className="stat-value">{Number(savingsBalance).toFixed(4)} ETH</div>
          </div>
          <div>
            <label className="label">Deposit (ETH)</label>
            <input className="input" value={savingsAmount} onChange={(e) => setSavingsAmount(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={depositSavings} disabled={busy}>
            Deposit to vault
          </button>
          <div className="border-t border-ink-700/50 pt-4 space-y-2">
            <label className="label">Withdraw shares</label>
            <input
              className="input"
              value={withdrawShares}
              onChange={(e) => setWithdrawShares(e.target.value)}
              placeholder={savingsShares}
            />
            <button className="btn-ghost w-full" onClick={withdrawSavings} disabled={busy}>
              Withdraw savings
            </button>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-gold-400" />
            <div className="font-display text-lg font-semibold text-ink-100">MockUSDC (mUSDC)</div>
          </div>
          <p className="text-sm text-ink-200">Phase I testnet stablecoin — mint as world governor (minter).</p>
          <div>
            <label className="label">Mint amount (mUSDC)</label>
            <input className="input" value={musdcMintAmount} onChange={(e) => setMusdcMintAmount(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={mintMusdc} disabled={busy}>
            Mint to my wallet
          </button>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-gold-400" />
            <div className="font-display text-lg font-semibold text-ink-100">Upward deposits</div>
          </div>
          <p className="text-sm text-ink-200">Recent voluntary funding toward parent institutions.</p>
          <ul className="max-h-40 space-y-2 overflow-y-auto text-sm">
            {upward.length === 0 ? (
              <li className="text-ink-200">No indexed deposits yet.</li>
            ) : (
              upward.map((d, i) => {
                const row = d as { amountWei?: string; depositorId?: string; createdAt?: string };
                return (
                  <li key={i} className="font-mono text-xs text-ink-100">
                    {row.depositorId?.slice(0, 10)}… →{" "}
                    {(Number(row.amountWei ?? 0) / 1e18).toFixed(4)} ETH
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>

      {canManageGroup ? (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gold-400" />
            <div className="font-display text-lg font-semibold text-ink-100">Group Lending</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={createGroup} disabled={busy}>
              Create group
            </button>
            <input className="input w-24" value={groupId} onChange={(e) => setGroupId(e.target.value)} placeholder="Group #" />
            <input
              className="input flex-1 min-w-[200px]"
              value={memberWallet}
              onChange={(e) => setMemberWallet(e.target.value)}
              placeholder="Member wallet"
            />
            <button className="btn-ghost" onClick={addGroupMember} disabled={busy}>
              Add member
            </button>
            <button className="btn-ghost" onClick={consentGroup} disabled={busy}>
              Record my consent
            </button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {groups.map((g) => {
              const row = g as {
                id: string;
                memberCount: number;
                consentCount: number;
                status: number;
              };
              return (
                <div key={row.id} className="rounded-xl border border-ink-600/60 bg-ink-900/60 p-3 text-sm">
                  Group #{row.id} · {row.memberCount} members · {row.consentCount} consents · status {row.status}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {canIblp ? (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-gold-400" />
            <div className="font-display text-lg font-semibold text-ink-100">Inter-bank lending (IBLP)</div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              className="input"
              value={iblpBorrower}
              onChange={(e) => setIblpBorrower(e.target.value)}
              placeholder="Borrower bank address"
            />
            <input className="input" value={iblpAmount} onChange={(e) => setIblpAmount(e.target.value)} placeholder="ETH" />
            <button className="btn-primary" onClick={iblpBorrow} disabled={busy}>
              Lend (7-day tenor)
            </button>
          </div>
          <ul className="space-y-2 text-sm">
            {iblpLoans.map((l) => {
              const row = l as {
                id: string;
                principalEth: string;
                borrower: string;
                status: number;
                tenorDays?: number;
              };
              return (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-ink-100"
                >
                  <span>
                    Loan #{row.id} · {row.principalEth} ETH → {row.borrower.slice(0, 10)}… · status{" "}
                    {row.status}
                  </span>
                  {row.status === 0 ? (
                    <button
                      className="btn-ghost text-xs"
                      onClick={() => iblpRepay(row.id, row.principalEth, row.tenorDays ?? 7)}
                      disabled={busy}
                    >
                      Repay
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
