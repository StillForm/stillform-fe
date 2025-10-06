import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { parseAbi, type Address } from "viem";
import { PhysStatus } from "../types/contracts";

// ABI for querying physicalization orders
const ART_PRODUCT_COLLECTION_ABI = parseAbi([
  "function physicalizationStatus(uint256) view returns (uint8)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
]);

export interface PhysicalizationOrder {
  collectionAddress: Address;
  tokenId: bigint;
  owner: Address;
  status: PhysStatus;
  collectionName?: string;
}

/**
 * 简单hook：获取用户在指定集合中拥有的NFT及其实体化状态
 * 一次性查询，不做实时监听
 */
export function useUserOrdersInCollection(
  userAddress: Address | undefined,
  collectionAddress: Address | undefined
) {
  // 先查询用户在该集合中有多少NFT
  const balanceQuery = useReadContracts({
    contracts:
      collectionAddress && userAddress
        ? [
            {
              address: collectionAddress,
              abi: ART_PRODUCT_COLLECTION_ABI,
              functionName: "balanceOf",
              args: [userAddress],
            },
          ]
        : [],
    query: {
      enabled: !!collectionAddress && !!userAddress,
    },
  });

  const balance = balanceQuery.data?.[0]?.result as bigint | undefined;

  // 根据balance查询所有tokenId
  const tokenQueries = useMemo(() => {
    if (!collectionAddress || !userAddress || !balance) return [];

    const queries: any[] = [];
    const count = Number(balance);

    for (let i = 0; i < count; i++) {
      queries.push({
        address: collectionAddress,
        abi: ART_PRODUCT_COLLECTION_ABI,
        functionName: "tokenOfOwnerByIndex",
        args: [userAddress, BigInt(i)],
      });
    }

    return queries;
  }, [collectionAddress, userAddress, balance]);

  const tokenIdsQuery = useReadContracts({
    contracts: tokenQueries,
    query: {
      enabled: tokenQueries.length > 0,
    },
  });

  const tokenIds = useMemo(() => {
    if (!tokenIdsQuery.data) return [];
    return tokenIdsQuery.data
      .filter((result) => result.status === "success")
      .map((result) => result.result as bigint);
  }, [tokenIdsQuery.data]);

  // 查询每个token的实体化状态
  const statusQueries = useMemo(() => {
    if (!collectionAddress || tokenIds.length === 0) return [];

    return tokenIds.map((tokenId) => ({
      address: collectionAddress,
      abi: ART_PRODUCT_COLLECTION_ABI,
      functionName: "physicalizationStatus",
      args: [tokenId],
    }));
  }, [collectionAddress, tokenIds]);

  const statusQuery = useReadContracts({
    contracts: statusQueries,
    query: {
      enabled: statusQueries.length > 0,
    },
  });

  // 组合结果
  const orders = useMemo(() => {
    if (!collectionAddress || !userAddress || !statusQuery.data) return [];

    return tokenIds
      .map((tokenId, index) => {
        const statusResult = statusQuery.data[index];
        if (statusResult?.status !== "success") return null;

        const status = Number(statusResult.result) as PhysStatus;

        // 只返回已申请实体化的NFT
        if (status === PhysStatus.NOT_REQUESTED) return null;

        return {
          collectionAddress,
          tokenId,
          owner: userAddress,
          status,
        };
      })
      .filter((order): order is PhysicalizationOrder => order !== null);
  }, [collectionAddress, userAddress, tokenIds, statusQuery.data]);

  const isLoading =
    balanceQuery.isLoading || tokenIdsQuery.isLoading || statusQuery.isLoading;
  const error = balanceQuery.error || tokenIdsQuery.error || statusQuery.error;

  return {
    orders,
    isLoading,
    error: error?.message || null,
  };
}

/**
 * 简单hook：获取用户在多个集合中的订单
 * 一次性查询，不做实时监听
 */
export function useUserOrders(
  userAddress: Address | undefined,
  collectionAddresses: Address[]
) {
  // 简化：查询所有集合的订单并合并
  const allOrders = useMemo(() => {
    const orders: PhysicalizationOrder[] = [];
    // 实际使用时需要为每个collection单独查询
    // 这里先返回空数组，在profile-view中处理
    return orders;
  }, []);

  return {
    orders: allOrders,
    isLoading: false,
    error: null,
  };
}

/**
 * 简单hook：获取创作者需要处理的订单
 * 一次性查询，不做实时监听
 */
export function useCreatorOrders(
  creatorAddress: Address | undefined,
  collectionAddresses: Address[]
) {
  // 简化：返回空数组，在profile-view中使用useUserOrdersInCollection处理
  return {
    orders: [] as PhysicalizationOrder[],
    isLoading: false,
    error: null,
  };
}
