import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { parseAbi, type Address } from "viem";
import { PhysStatus } from "../types/contracts";

// ABI for querying physicalization orders
const ART_PRODUCT_COLLECTION_ABI = parseAbi([
  "function physicalizationStatus(uint256) view returns (uint8)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "event PhysicalizationRequested(uint256 indexed tokenId, address indexed owner)",
  "event PhysicalizationProcessing(uint256 indexed tokenId)",
  "event PhysicalizationCompleted(uint256 indexed tokenId, string finalUri)",
]);

export interface PhysicalizationOrder {
  collectionAddress: Address;
  tokenId: bigint;
  owner: Address;
  status: PhysStatus;
  collectionName?: string;
}

/**
 * Hook to get all physicalization orders for a specific collection
 * @param collectionAddress The address of the ArtProductCollection contract
 */
export function useCollectionOrders(collectionAddress: Address | undefined) {
  const publicClient = usePublicClient();
  const [orders, setOrders] = useState<PhysicalizationOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient || !collectionAddress) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 获取总供应量
        const totalSupply = (await publicClient.readContract({
          address: collectionAddress,
          abi: ART_PRODUCT_COLLECTION_ABI,
          functionName: "totalSupply",
        })) as bigint;

        const ordersList: PhysicalizationOrder[] = [];

        // 遍历所有tokenId，查询实体化状态
        for (let i = 0n; i < totalSupply; i++) {
          try {
            // 获取tokenId
            const tokenId = (await publicClient.readContract({
              address: collectionAddress,
              abi: ART_PRODUCT_COLLECTION_ABI,
              functionName: "tokenByIndex",
              args: [i],
            })) as bigint;

            // 获取实体化状态
            const status = (await publicClient.readContract({
              address: collectionAddress,
              abi: ART_PRODUCT_COLLECTION_ABI,
              functionName: "physicalizationStatus",
              args: [tokenId],
            })) as number;

            // 只收集已申请实体化的NFT（状态不为NOT_REQUESTED）
            if (status !== PhysStatus.NOT_REQUESTED) {
              // 获取所有者
              const owner = (await publicClient.readContract({
                address: collectionAddress,
                abi: ART_PRODUCT_COLLECTION_ABI,
                functionName: "ownerOf",
                args: [tokenId],
              })) as Address;

              ordersList.push({
                collectionAddress,
                tokenId,
                owner,
                status: status as PhysStatus,
              });
            }
          } catch (err) {
            console.error(`Failed to fetch order for token ${i}:`, err);
            // 继续处理下一个token
          }
        }

        setOrders(ordersList);
      } catch (err) {
        console.error("Failed to fetch collection orders:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [publicClient, collectionAddress]);

  return {
    orders,
    isLoading,
    error,
  };
}

/**
 * Hook to get all physicalization orders created by a specific creator
 * @param creatorAddress The address of the creator
 * @param collectionAddresses Array of collection addresses owned by the creator
 */
export function useCreatorOrders(
  creatorAddress: Address | undefined,
  collectionAddresses: Address[]
) {
  const publicClient = usePublicClient();
  const [orders, setOrders] = useState<PhysicalizationOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient || !creatorAddress || collectionAddresses.length === 0) {
      setOrders([]);
      return;
    }

    const fetchAllOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const allOrders: PhysicalizationOrder[] = [];

        // 遍历所有集合
        for (const collectionAddress of collectionAddresses) {
          try {
            // 获取总供应量
            const totalSupply = (await publicClient.readContract({
              address: collectionAddress,
              abi: ART_PRODUCT_COLLECTION_ABI,
              functionName: "totalSupply",
            })) as bigint;

            // 遍历所有tokenId
            for (let i = 0n; i < totalSupply; i++) {
              try {
                // 获取tokenId
                const tokenId = (await publicClient.readContract({
                  address: collectionAddress,
                  abi: ART_PRODUCT_COLLECTION_ABI,
                  functionName: "tokenByIndex",
                  args: [i],
                })) as bigint;

                // 获取实体化状态
                const status = (await publicClient.readContract({
                  address: collectionAddress,
                  abi: ART_PRODUCT_COLLECTION_ABI,
                  functionName: "physicalizationStatus",
                  args: [tokenId],
                })) as number;

                // 只收集已申请实体化的NFT
                if (status !== PhysStatus.NOT_REQUESTED) {
                  // 获取所有者
                  const owner = (await publicClient.readContract({
                    address: collectionAddress,
                    abi: ART_PRODUCT_COLLECTION_ABI,
                    functionName: "ownerOf",
                    args: [tokenId],
                  })) as Address;

                  allOrders.push({
                    collectionAddress,
                    tokenId,
                    owner,
                    status: status as PhysStatus,
                  });
                }
              } catch (err) {
                console.error(
                  `Failed to fetch order for token ${i} in collection ${collectionAddress}:`,
                  err
                );
              }
            }
          } catch (err) {
            console.error(
              `Failed to fetch orders for collection ${collectionAddress}:`,
              err
            );
          }
        }

        setOrders(allOrders);
      } catch (err) {
        console.error("Failed to fetch creator orders:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllOrders();
  }, [publicClient, creatorAddress, collectionAddresses]);

  return {
    orders,
    isLoading,
    error,
  };
}

/**
 * Hook to get all physicalization orders for a specific user (buyer)
 * @param userAddress The address of the user
 * @param collectionAddresses Array of collection addresses to check
 */
export function useUserOrders(
  userAddress: Address | undefined,
  collectionAddresses: Address[]
) {
  const publicClient = usePublicClient();
  const [orders, setOrders] = useState<PhysicalizationOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient || !userAddress || collectionAddresses.length === 0) {
      setOrders([]);
      return;
    }

    const fetchUserOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userOrders: PhysicalizationOrder[] = [];

        // 遍历所有集合
        for (const collectionAddress of collectionAddresses) {
          try {
            // 获取总供应量
            const totalSupply = (await publicClient.readContract({
              address: collectionAddress,
              abi: ART_PRODUCT_COLLECTION_ABI,
              functionName: "totalSupply",
            })) as bigint;

            // 遍历所有tokenId
            for (let i = 0n; i < totalSupply; i++) {
              try {
                // 获取tokenId
                const tokenId = (await publicClient.readContract({
                  address: collectionAddress,
                  abi: ART_PRODUCT_COLLECTION_ABI,
                  functionName: "tokenByIndex",
                  args: [i],
                })) as bigint;

                // 获取所有者
                const owner = (await publicClient.readContract({
                  address: collectionAddress,
                  abi: ART_PRODUCT_COLLECTION_ABI,
                  functionName: "ownerOf",
                  args: [tokenId],
                })) as Address;

                // 只处理用户拥有的NFT
                if (owner.toLowerCase() === userAddress.toLowerCase()) {
                  // 获取实体化状态
                  const status = (await publicClient.readContract({
                    address: collectionAddress,
                    abi: ART_PRODUCT_COLLECTION_ABI,
                    functionName: "physicalizationStatus",
                    args: [tokenId],
                  })) as number;

                  // 只收集已申请实体化的NFT
                  if (status !== PhysStatus.NOT_REQUESTED) {
                    userOrders.push({
                      collectionAddress,
                      tokenId,
                      owner,
                      status: status as PhysStatus,
                    });
                  }
                }
              } catch (err) {
                console.error(
                  `Failed to fetch order for token ${i} in collection ${collectionAddress}:`,
                  err
                );
              }
            }
          } catch (err) {
            console.error(
              `Failed to fetch orders for collection ${collectionAddress}:`,
              err
            );
          }
        }

        setOrders(userOrders);
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserOrders();
  }, [publicClient, userAddress, collectionAddresses]);

  return {
    orders,
    isLoading,
    error,
  };
}
