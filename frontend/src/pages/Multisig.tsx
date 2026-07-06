import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { encodeAbiParameters, encodeFunctionData, keccak256, parseEther } from "viem";
import toast from "react-hot-toast";
import { ShieldCheck, Users, Play } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { contractAddresses, governorMultisigAbi, worldBankAbi } from "@/lib/contracts";
import { contractsConfigured } from "@/lib/onChain";
import { useOnChainTx } from "@/hooks/useOnChainTx";

function operationId(target: `0x${string}`, data: `0x${string}`) {
  return keccak256(
    encodeAbiParameters(
      [{ type: "address" }, { type: "bytes" }],
      [target, data],
    ),
  );
}

export function Multisig() {
  const { address, isConnected } = useAccount();
  const onChain = contractsConfigured();
  const multisig = contractAddresses.governorMultisig;
  const { write, busy } = useOnChainTx();

  const [allocateAmount, setAllocateAmount] = useState("0.05");
  const [storedOpId, setStoredOpId] = useState<`0x${string}` | "">("");

  const { data: isOwner } = useReadContract({
    address: multisig || undefined,
    abi: governorMultisigAbi,
    functionName: "isOwner",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(multisig && address) },
  });

  const builtOp = (() => {
    if (!contractAddresses.worldBank || !contractAddresses.nationalBank) return null;
    const data = encodeFunctionData({
      abi: worldBankAbi,
      functionName: "allocate",
      args: [contractAddresses.nationalBank, parseEther(allocateAmount)],
    });
    return {
      target: contractAddresses.worldBank,
      data,
      opId: operationId(contractAddresses.worldBank, data),
    };
  })();

  const opId = storedOpId || builtOp?.opId || "";

  const { data: confirmCount } = useReadContract({
    address: multisig || undefined,
    abi: governorMultisigAbi,
    functionName: "confirmationCount",
    args: opId ? [opId as `0x${string}`] : undefined,
    query: { enabled: Boolean(multisig && opId) },
  });

  function confirmOp() {
    if (!multisig || !builtOp || !isConnected) {
      toast.error("Connect an owner wallet");
      return;
    }
    setStoredOpId(builtOp.opId);
    write({
      address: multisig,
      abi: governorMultisigAbi,
      functionName: "confirm",
      args: [builtOp.opId],
    });
  }

  function executeOp() {
    if (!multisig || !builtOp || !isConnected) return;
    write({
      address: multisig,
      abi: governorMultisigAbi,
      functionName: "execute",
      args: [builtOp.target, builtOp.data, builtOp.opId],
    });
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Phase I · DT-I.18"
        title="Governor Multisig (2-of-3)"
        description="Confirm and execute World Bank governor actions from two of three owner wallets."
        right={
          <span className="badge-gold">
            <ShieldCheck className="h-3.5 w-3.5" />
            MVT #15
          </span>
        }
      />

      {!onChain || !multisig ? (
        <div className="card p-6 text-sm text-amber-200">
          Deploy contracts and run <code className="font-mono">npm run sync:env</code> to load the
          multisig address.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gold-400" />
              <div className="font-display text-lg font-semibold text-ink-100">Your signer</div>
            </div>
            <p className="text-sm text-ink-200 font-mono">{address ?? "Not connected"}</p>
            <p className="text-sm text-ink-200">
              Multisig owner:{" "}
              <span className={isOwner ? "text-green-300" : "text-amber-300"}>
                {isOwner ? "Yes" : "No — switch to owner account 0, 1, or 4"}
              </span>
            </p>
            <p className="text-xs text-ink-200 break-all">Multisig: {multisig}</p>
          </div>

          <div className="card p-6 space-y-4">
            <div className="font-display text-lg font-semibold text-ink-100">
              Demo: allocate via multisig
            </div>
            <p className="text-sm text-ink-200">
              1) Owner A confirms · 2) Owner B confirms · 3) Either owner executes
            </p>
            <div>
              <label className="label">Allocate to National (ETH)</label>
              <input
                className="input"
                value={allocateAmount}
                onChange={(e) => setAllocateAmount(e.target.value)}
              />
            </div>
            <div className="text-xs font-mono text-ink-200 break-all">
              Op ID: {opId || "—"}
              <br />
              Confirmations: {confirmCount ?? 0} / 2
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" onClick={confirmOp} disabled={busy || !isOwner}>
                Confirm operation
              </button>
              <button className="btn-ghost" onClick={executeOp} disabled={busy || !isOwner}>
                <Play className="h-4 w-4" />
                Execute (2+ confirms)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
