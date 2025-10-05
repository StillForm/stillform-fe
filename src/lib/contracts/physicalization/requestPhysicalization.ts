import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import type { Address } from "viem";

// ABI for the physicalization functions
const ART_PRODUCT_COLLECTION_ABI = parseAbi([
  "function requestPhysicalization(uint256 tokenId)",
  "function markProcessing(uint256 tokenId)",
  "function completePhysicalization(uint256 tokenId, string finalUri)",
  "function physicalizationStatus(uint256) view returns (uint8)",
  "function locked(uint256 tokenId) view returns (bool)",
]);

/**
 * Hook to request physicalization of an NFT
 * @param collectionAddress The address of the ArtProductCollection contract
 */
export function useRequestPhysicalization(collectionAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const requestPhysicalization = async (tokenId: bigint) => {
    return writeContract({
      address: collectionAddress,
      abi: ART_PRODUCT_COLLECTION_ABI,
      functionName: "requestPhysicalization",
      args: [tokenId],
    });
  };

  return {
    requestPhysicalization,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error || confirmError,
  };
}

/**
 * Hook to mark an NFT as processing (seller action)
 * @param collectionAddress The address of the ArtProductCollection contract
 */
export function useMarkProcessing(collectionAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const markProcessing = async (tokenId: bigint) => {
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
 * Hook to complete physicalization of an NFT (seller action)
 * @param collectionAddress The address of the ArtProductCollection contract
 */
export function useCompletePhysicalization(collectionAddress: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const completePhysicalization = async (tokenId: bigint, finalUri: string) => {
    return writeContract({
      address: collectionAddress,
      abi: ART_PRODUCT_COLLECTION_ABI,
      functionName: "completePhysicalization",
      args: [tokenId, finalUri],
    });
  };

  return {
    completePhysicalization,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error || confirmError,
  };
}
