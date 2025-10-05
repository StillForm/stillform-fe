import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi, type Address } from "viem";

// ABI for managing physicalization orders
const ART_PRODUCT_COLLECTION_ABI = parseAbi([
  "function markProcessing(uint256 tokenId)",
  "function completePhysicalization(uint256 tokenId, string finalUri)",
]);

/**
 * Hook to mark an order as processing (creator action)
 * @param collectionAddress The address of the ArtProductCollection contract
 */
export function useMarkOrderProcessing(collectionAddress: Address | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const markProcessing = async (tokenId: bigint) => {
    if (!collectionAddress) {
      throw new Error("Collection address is required");
    }

    return writeContract({
      address: collectionAddress,
      abi: ART_PRODUCT_COLLECTION_ABI,
      functionName: "markProcessing",
      args: [tokenId],
    });
  };

  return {
    markProcessing,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error || confirmError,
  };
}

/**
 * Hook to complete an order (creator action)
 * @param collectionAddress The address of the ArtProductCollection contract
 */
export function useCompleteOrder(collectionAddress: Address | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const completeOrder = async (tokenId: bigint, finalUri: string = "") => {
    if (!collectionAddress) {
      throw new Error("Collection address is required");
    }

    return writeContract({
      address: collectionAddress,
      abi: ART_PRODUCT_COLLECTION_ABI,
      functionName: "completePhysicalization",
      args: [tokenId, finalUri],
    });
  };

  return {
    completeOrder,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error || confirmError,
  };
}

/**
 * Batch hook to manage multiple orders from different collections
 * Provides a unified interface for marking processing and completing orders
 */
export function useOrderManager() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const markProcessing = async (
    collectionAddress: Address,
    tokenId: bigint
  ) => {
    return writeContract({
      address: collectionAddress,
      abi: ART_PRODUCT_COLLECTION_ABI,
      functionName: "markProcessing",
      args: [tokenId],
    });
  };

  const completeOrder = async (
    collectionAddress: Address,
    tokenId: bigint,
    finalUri: string = ""
  ) => {
    return writeContract({
      address: collectionAddress,
      abi: ART_PRODUCT_COLLECTION_ABI,
      functionName: "completePhysicalization",
      args: [tokenId, finalUri],
    });
  };

  return {
    markProcessing,
    completeOrder,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error || confirmError,
  };
}
