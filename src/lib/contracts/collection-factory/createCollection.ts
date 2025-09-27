import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { COLLECTION_FACTORY_ADDRESS } from "../config/addresses";
import type { CreateCollectionParams } from "../types/contracts";

// CollectionFactory ABI - 使用 parseAbi 来避免类型问题
const COLLECTION_FACTORY_ABI = parseAbi([
  "function createCollection(string name, string symbol, (uint8 ptype, uint256 price, uint32 maxSupply, string unrevealedUri, address creator, address registry) config, (uint16 weightBp, uint32 maxSupply, uint32 minted, string baseUri)[] styles) returns (address collection)",
]);

/**
 * Hook for creating a new NFT collection
 *
 * @example
 * ```tsx
 * const { createCollection, isPending, error } = useCreateCollection()
 *
 * const handleCreate = async () => {
 *   try {
 *     const result = await createCollection({
 *       name: "My Collection",
 *       symbol: "MC",
 *       config: {
 *         ptype: ProductType.NORMAL,
 *         price: parseEther("0.1"),
 *         maxSupply: 1000,
 *         unrevealedUri: "",
 *         creator: "0x...",
 *         registry: REGISTRY_ADDRESS
 *       },
 *       styles: [{
 *         weightBp: 10000,
 *         maxSupply: 1000,
 *         minted: 0,
 *         baseUri: "https://..."
 *       }]
 *     })
 *     console.log('Collection created:', result)
 *   } catch (err) {
 *     console.error('Failed to create collection:', err)
 *   }
 * }
 * ```
 */
export function useCreateCollection() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const createCollection = async (params: CreateCollectionParams) => {
    return writeContract({
      address: COLLECTION_FACTORY_ADDRESS,
      abi: COLLECTION_FACTORY_ABI,
      functionName: "createCollection",
      // @ts-expect-error - wagmi 类型推断过于严格，运行时类型是正确的
      args: [params.name, params.symbol, params.config, params.styles],
    });
  };

  return {
    createCollection,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error || confirmError,
  };
}

/**
 * 辅助函数：验证盲盒样式权重
 */
export function validateBlindboxStyles(
  styles: CreateCollectionParams["styles"]
): boolean {
  if (styles.length < 2) return false;

  const totalWeight = styles.reduce((sum, style) => sum + style.weightBp, 0);
  return totalWeight === 10000;
}

/**
 * 辅助函数：创建普通NFT的默认样式
 */
export function createNormalStyle(baseUri: string, maxSupply: number) {
  return [
    {
      weightBp: 10000,
      maxSupply,
      minted: 0,
      baseUri,
    },
  ];
}
