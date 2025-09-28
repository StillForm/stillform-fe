import {
  useRecentCollections,
  CollectionCreatedEvent,
} from "@/lib/contracts/common/events";
import { useState, useEffect } from "react";

export interface ProductionCollection {
  address: `0x${string}`;
  creator: `0x${string}`;
  name: string;
  symbol: string;
  totalSupply: bigint;
  config: {
    ptype: number;
    price: bigint;
    maxSupply: number;
    unrevealedUri: string;
    creator: `0x${string}`;
    registry: `0x${string}`;
  };
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

/**
 * Core function to fetch collection details from events
 * 核心请求函数，可以在各种场景中使用
 */
export async function fetchAllProductions(
  events: CollectionCreatedEvent[]
): Promise<ProductionCollection[]> {
  try {
    // For each collection event, fetch detailed information
    const productionPromises = events.map(
      async (event: CollectionCreatedEvent) => {
        try {
          // Note: In a full implementation, we would make actual contract calls here
          // to fetch name(), symbol(), totalSupply(), and config() from each collection
          // For now, we'll return the basic event data with placeholder details
          return {
            address: event.collection,
            creator: event.creator,
            name: `Collection ${event.collection.slice(0, 8)}...`, // Placeholder
            symbol: "ART", // Placeholder
            totalSupply: BigInt(0), // Placeholder
            config: {
              ptype: 0,
              price: BigInt(0),
              maxSupply: 0,
              unrevealedUri: "",
              creator: event.creator,
              registry:
                "0x0000000000000000000000000000000000000000" as `0x${string}`,
            },
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          } as ProductionCollection;
        } catch (err) {
          console.error(
            `Failed to fetch details for collection ${event.collection}:`,
            err
          );
          return null;
        }
      }
    );

    const results = await Promise.all(productionPromises);
    return results.filter((p): p is ProductionCollection => p !== null);
  } catch (err) {
    console.error("Failed to fetch production details:", err);
    throw err;
  }
}

/**
 * Hook version to get all productions (collections) from recent blocks
 * Hook版本，适用于React组件中使用
 * 一期暂时先从最近 n 个区块里面读，后续改为走后端接口
 */
export function useAllProductions(blocksToScan: number = 1000) {
  const {
    collections: events,
    isLoading: eventsLoading,
    error: eventsError,
  } = useRecentCollections(blocksToScan);
  const [productions, setProductions] = useState<ProductionCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!events.length || eventsLoading) return;

    const fetchCollectionDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await fetchAllProductions(events);
        setProductions(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [events, eventsLoading]);

  return {
    productions,
    isLoading: eventsLoading || isLoading,
    error: eventsError || error,
    refetch: () => {
      // This would trigger a refetch of the events
      setError(null);
    },
  };
}
