import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { parseAbi, decodeEventLog } from "viem";
import type { Address } from "viem";
import { PRIMARY_MARKET_ADDRESS } from "../config/addresses";

const PRIMARY_MARKET_ABI = parseAbi([
  "event Sale(address indexed collection, address indexed buyer, uint256 indexed tokenId, uint256 price)",
]);

export interface UserPurchase {
  collection: Address;
  tokenId: bigint;
  price: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

/**
 * Hook to get all purchases made by a user by listening to Sale events
 * @param userAddress The address of the user to query
 * @param blocksToScan Number of recent blocks to scan for events (default: 10000)
 */
export function useUserPurchasedCollections(
  userAddress: Address | undefined,
  blocksToScan: number = 1000
) {
  const publicClient = usePublicClient();
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient || !userAddress) return;

    const fetchUserPurchases = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get current block number
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - BigInt(blocksToScan);

        // Query Sale events for this user
        const logs = await publicClient.getLogs({
          address: PRIMARY_MARKET_ADDRESS,
          event: parseAbi([
            "event Sale(address indexed collection, address indexed buyer, uint256 indexed tokenId, uint256 price)",
          ])[0],
          args: {
            buyer: userAddress,
          },
          fromBlock,
          toBlock: currentBlock,
        });

        // Parse events into purchase objects
        const userPurchases: UserPurchase[] = logs.map((log) => {
          const decoded = decodeEventLog({
            abi: PRIMARY_MARKET_ABI,
            data: log.data,
            topics: log.topics,
          });

          return {
            collection: decoded.args.collection,
            tokenId: decoded.args.tokenId,
            price: decoded.args.price,
            blockNumber: log.blockNumber || 0n,
            transactionHash: log.transactionHash || "0x0",
          };
        });

        setPurchases(userPurchases);
      } catch (err) {
        console.error("Failed to fetch user purchases:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPurchases();
  }, [publicClient, userAddress, blocksToScan]);

  return {
    purchases,
    isLoading,
    error,
  };
}

/**
 * Hook to get unique collection addresses from user purchases
 * @param userAddress The address of the user to query
 * @param blocksToScan Number of recent blocks to scan for events (default: 10000)
 */
export function useUserCollectionAddresses(
  userAddress: Address | undefined,
  blocksToScan: number = 10000
) {
  const { purchases, isLoading, error } = useUserPurchasedCollections(
    userAddress,
    blocksToScan
  );

  // Extract unique collection addresses
  const collectionAddresses = Array.from(
    new Set(purchases.map((purchase) => purchase.collection))
  ) as Address[];

  return {
    collectionAddresses,
    isLoading,
    error,
  };
}
