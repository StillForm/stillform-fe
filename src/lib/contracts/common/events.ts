import { decodeEventLog, parseAbi } from "viem";
import { useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useState, useEffect } from "react";
import { COLLECTION_FACTORY_ADDRESS } from "../config/addresses";

/** Hook to read logs */
export function useTransactionLogs(hash: `0x${string}` | undefined) {
  const {
    data: receipt,
    isLoading,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const parseCollectionCreated = () => {
    if (!receipt?.logs) return null;

    try {
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: parseAbi([
              "event CollectionCreated(address indexed creator, address indexed collection, bytes32 configHash)",
            ]),
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "CollectionCreated") {
            return {
              creator: decoded.args.creator,
              collection: decoded.args.collection,
              configHash: decoded.args.configHash,
            };
          }
        } catch {
          continue;
        }
      }
    } catch (error) {
      console.error("Failed to parse CollectionCreated event:", error);
    }

    return null;
  };

  return {
    receipt,
    logs: receipt?.logs || [],
    isLoading,
    isSuccess,
    // 提供一个解析 CollectionCreated 的方法
    parseCollectionCreated,
  };
}

export interface CollectionCreatedEvent {
  creator: `0x${string}`;
  collection: `0x${string}`;
  configHash: `0x${string}`;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

/**
 * Hook to scan recent blocks for CollectionCreated events
 * @param blocksToScan Number of recent blocks to scan (default: 10000)
 */
export function useRecentCollections(blocksToScan: number = 10000) {
  const publicClient = usePublicClient();
  const [collections, setCollections] = useState<CollectionCreatedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient) return;

    const fetchRecentCollections = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get current block number
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - BigInt(blocksToScan);

        // Query CollectionCreated events
        const logs = await publicClient.getLogs({
          address: COLLECTION_FACTORY_ADDRESS,
          event: parseAbi([
            "event CollectionCreated(address indexed creator, address indexed collection, bytes32 configHash)",
          ])[0],
          fromBlock,
          toBlock: currentBlock,
        });

        // Parse events
        const parsedCollections: CollectionCreatedEvent[] = logs.map((log) => {
          const decoded = decodeEventLog({
            abi: parseAbi([
              "event CollectionCreated(address indexed creator, address indexed collection, bytes32 configHash)",
            ]),
            data: log.data,
            topics: log.topics,
          });

          return {
            creator: decoded.args.creator,
            collection: decoded.args.collection,
            configHash: decoded.args.configHash,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
          };
        });

        setCollections(parsedCollections);
      } catch (err) {
        console.error("Failed to fetch recent collections:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentCollections();
  }, [publicClient, blocksToScan]);

  return {
    collections,
    isLoading,
    error,
    refetch: () => {
      if (publicClient) {
        // Re-trigger the effect by updating a dependency
        setError(null);
      }
    },
  };
}

/**
 * Hook to get collections created by a specific user from recent blocks
 */
export function useUserRecentCollections(
  userAddress: `0x${string}` | undefined
) {
  const { collections, isLoading, error, refetch } = useRecentCollections();

  const userCollections = collections.filter(
    (collection) =>
      userAddress &&
      collection.creator.toLowerCase() === userAddress.toLowerCase()
  );

  return {
    collections: userCollections,
    isLoading,
    error,
    refetch,
  };
}
