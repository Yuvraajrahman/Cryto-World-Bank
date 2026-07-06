import { useEffect } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import toast from "react-hot-toast";
export function useOnChainTx(onSuccess) {
    const { writeContract, data: txHash, isPending, error, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });
    useEffect(() => {
        if (error) {
            toast.error(error.message.slice(0, 140));
            reset();
        }
    }, [error, reset]);
    useEffect(() => {
        if (isSuccess) {
            toast.success("Transaction confirmed");
            onSuccess?.();
            reset();
        }
    }, [isSuccess, onSuccess, reset]);
    function write(args) {
        writeContract(args);
    }
    return { write, txHash, busy: isPending || isConfirming, reset };
}
