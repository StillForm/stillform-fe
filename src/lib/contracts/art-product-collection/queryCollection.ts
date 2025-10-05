import { useEffect, useState } from "react";
import { usePublicClient, useReadContract, useReadContracts } from "wagmi";
import { parseAbi, decodeEventLog } from "viem";
import type { Address } from "viem";
import { PRIMARY_MARKET_ADDRESS } from "../config/addresses";

const PRIMARY_MARKET_ABI = parseAbi([
  "event Sale(address indexed collection, address indexed buyer, uint256 indexed tokenId, uint256 price)",
]);

const ART_PRODUCT_COLLECTION_ABI = parseAbi([
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
]);

export interface UserPurchase {
  collection: Address;
  tokenId: bigint;
  price: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
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

/**
 * Hook to get tokenURI for a specific NFT
 * @param collectionAddress The address of the collection contract
 * @param tokenId The token ID to query
 */
export function useTokenURI(
  collectionAddress: Address | undefined,
  tokenId: bigint | undefined
) {
  const {
    data: tokenURI,
    isLoading,
    error,
  } = useReadContract({
    address: collectionAddress,
    abi: ART_PRODUCT_COLLECTION_ABI,
    functionName: "tokenURI",
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!collectionAddress && !!tokenId,
    },
  });

  console.log("useTokenURI debug:", {
    collectionAddress,
    tokenId: tokenId?.toString(),
    tokenURI,
    isLoading,
    error,
  });

  return {
    tokenURI,
    isLoading,
    error,
  };
}

/**
 * Hook to get NFT metadata from tokenURI
 * @param collectionAddress The address of the collection contract
 * @param tokenId The token ID to query
 */
export function useNFTMetadata(
  collectionAddress: Address | undefined,
  tokenId: bigint | undefined
) {
  const {
    tokenURI,
    isLoading: isTokenURILoading,
    error: tokenURIError,
  } = useTokenURI(collectionAddress, tokenId);
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenURI) return;

    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching metadata from:", tokenURI);
        const response = await fetch(tokenURI);
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Fetched metadata:", data);
        setMetadata(data);
      } catch (err) {
        console.error("Failed to fetch NFT metadata:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenURI]);

  return {
    metadata,
    isLoading: isTokenURILoading || isLoading,
    error: tokenURIError || error,
  };
}

/**
 * Hook to get user's token IDs in a specific collection
 * @param collectionAddress The address of the collection contract
 * @param userAddress The address of the user to query
 */
export function useUserTokenIds(
  collectionAddress: Address | undefined,
  userAddress: Address | undefined
) {
  const {
    data: balance,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useReadContract({
    address: collectionAddress,
    abi: ART_PRODUCT_COLLECTION_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!collectionAddress && !!userAddress,
    },
  });

  // 获取用户拥有的所有token IDs
  const tokenIdsContracts =
    balance && userAddress && collectionAddress
      ? Array.from({ length: Number(balance) }, (_, index) => ({
          address: collectionAddress,
          abi: ART_PRODUCT_COLLECTION_ABI,
          functionName: "tokenOfOwnerByIndex",
          args: [userAddress, BigInt(index)],
        }))
      : [];

  const {
    data: tokenIdsData,
    isLoading: isTokenIdsLoading,
    error: tokenIdsError,
  } = useReadContracts({
    contracts: tokenIdsContracts,
    query: {
      enabled:
        !!collectionAddress &&
        !!userAddress &&
        !!balance &&
        Number(balance) > 0,
    },
  });

  const tokenIds = tokenIdsData
    ? tokenIdsData
        .filter((result) => result.status === "success")
        .map((result) => result.result as bigint)
    : [];

  const isLoading = isBalanceLoading || isTokenIdsLoading;
  const error = balanceError || tokenIdsError;

  return {
    tokenIds,
    isLoading,
    error: error ? error.message : null,
  };
}
