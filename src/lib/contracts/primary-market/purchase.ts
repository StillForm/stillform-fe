import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi, type Address, parseEther } from "viem";
import { PRIMARY_MARKET_ADDRESS } from "../config/addresses";

// PrimaryMarket ABI (minimal for purchase)
const PRIMARY_MARKET_ABI = parseAbi([
  "function purchase(address collectionAddress) payable",
]);

export function usePrimaryPurchase() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });

  /**
   * Purchase a primary-market NFT.
   * @param collection Address of the collection to purchase from
   * @param valueWei Payment value in wei
   */
  const purchase = async (collection: Address, valueWei: bigint) => {
    return writeContract({
      address: PRIMARY_MARKET_ADDRESS,
      abi: PRIMARY_MARKET_ABI,
      functionName: "purchase",
      args: [collection],
      value: valueWei,
    });
  };

  /**
   * Convenience: purchase using an ETH string value, e.g. "0.05"
   */
  const purchaseEth = async (collection: Address, valueEth: string) => {
    const valueWei = parseEther(valueEth);
    return purchase(collection, valueWei);
  };

  return {
    purchase,
    purchaseEth,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error || confirmError,
  };
}
