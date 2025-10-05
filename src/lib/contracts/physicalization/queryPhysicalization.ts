import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { parseAbi } from "viem";
import type { Address } from "viem";
import { PhysStatus } from "../types/contracts";

// ABI for the physicalization query functions
const ART_PRODUCT_COLLECTION_ABI = parseAbi([
  "function physicalizationStatus(uint256) view returns (uint8)",
  "function locked(uint256 tokenId) view returns (bool)",
]);

/**
 * Hook to get the physicalization status of an NFT
 * @param collectionAddress The address of the ArtProductCollection contract
 * @param tokenId The ID of the token to query
 */
export function usePhysicalizationStatus(
  collectionAddress: Address | undefined,
  tokenId: bigint | undefined
) {
  const publicClient = usePublicClient();
  const [status, setStatus] = useState<PhysStatus>(PhysStatus.NOT_REQUESTED);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient || !collectionAddress || tokenId === undefined) return;

    const fetchStatus = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await publicClient.readContract({
          address: collectionAddress,
          abi: ART_PRODUCT_COLLECTION_ABI,
          functionName: "physicalizationStatus",
          args: [tokenId],
        });

        setStatus(Number(result) as PhysStatus);
      } catch (err) {
        console.error("Failed to fetch physicalization status:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [publicClient, collectionAddress, tokenId]);

  return {
    status,
    isLoading,
    error,
  };
}

/**
 * Hook to check if an NFT is locked
 * @param collectionAddress The address of the ArtProductCollection contract
 * @param tokenId The ID of the token to query
 */
export function useIsNFTLocked(
  collectionAddress: Address | undefined,
  tokenId: bigint | undefined
) {
  const publicClient = usePublicClient();
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient || !collectionAddress || tokenId === undefined) return;

    const fetchLockStatus = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await publicClient.readContract({
          address: collectionAddress,
          abi: ART_PRODUCT_COLLECTION_ABI,
          functionName: "locked",
          args: [tokenId],
        });

        setIsLocked(result as boolean);
      } catch (err) {
        console.error("Failed to fetch lock status:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLockStatus();
  }, [publicClient, collectionAddress, tokenId]);

  return {
    isLocked,
    isLoading,
    error,
  };
}
