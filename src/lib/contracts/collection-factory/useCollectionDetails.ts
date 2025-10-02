import { useReadContract, useReadContracts } from "wagmi";
import { parseAbi } from "viem";
import type { Address } from "viem";

// ArtProductCollection ABI - 只包含我们需要读取的函数
const ART_PRODUCT_COLLECTION_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function config() view returns (uint8 ptype, uint256 price, uint32 maxSupply, string unrevealedUri, address creator, address registry)",
  "function styles(uint256) view returns (uint16 weightBp, uint32 maxSupply, uint32 minted, string baseUri)",
  "function totalSupply() view returns (uint256)",
]);

// 定义返回类型
type ConfigResult = [bigint, bigint, bigint, string, Address, Address];
type StyleResult = [bigint, bigint, bigint, string];

export interface CollectionDetails {
  name: string;
  symbol: string;
  config: {
    ptype: number;
    price: bigint;
    maxSupply: number;
    unrevealedUri: string;
    creator: Address;
    registry: Address;
  };
  styles: Array<{
    weightBp: number;
    maxSupply: number;
    minted: number;
    baseUri: string;
  }>;
  totalSupply: bigint;
  address: Address;
}

/**
 * Hook to get collection details from a collection address
 */
export function useCollectionDetails(collectionAddress: Address | undefined) {
  // 获取集合名称
  const {
    data: name,
    isLoading: isNameLoading,
    error: nameError,
  } = useReadContract({
    address: collectionAddress,
    abi: ART_PRODUCT_COLLECTION_ABI,
    functionName: "name",
    query: {
      enabled: !!collectionAddress,
    },
  });

  // 获取集合符号
  const {
    data: symbol,
    isLoading: isSymbolLoading,
    error: symbolError,
  } = useReadContract({
    address: collectionAddress,
    abi: ART_PRODUCT_COLLECTION_ABI,
    functionName: "symbol",
    query: {
      enabled: !!collectionAddress,
    },
  });

  // 获取集合配置
  const {
    data: config,
    isLoading: isConfigLoading,
    error: configError,
  } = useReadContract({
    address: collectionAddress,
    abi: ART_PRODUCT_COLLECTION_ABI,
    functionName: "config",
    query: {
      enabled: !!collectionAddress,
    },
  });

  // 获取总供应量
  const {
    data: totalSupply,
    isLoading: isTotalSupplyLoading,
    error: totalSupplyError,
  } = useReadContract({
    address: collectionAddress,
    abi: ART_PRODUCT_COLLECTION_ABI,
    functionName: "totalSupply",
    query: {
      enabled: !!collectionAddress,
    },
  });

  // 获取第一个样式（通常包含图片信息）
  const {
    data: firstStyle,
    isLoading: isStyleLoading,
    error: styleError,
  } = useReadContract({
    address: collectionAddress,
    abi: ART_PRODUCT_COLLECTION_ABI,
    functionName: "styles",
    args: [BigInt(0)], // 获取第一个样式
    query: {
      enabled: !!collectionAddress,
    },
  });

  const isLoading =
    isNameLoading ||
    isSymbolLoading ||
    isConfigLoading ||
    isTotalSupplyLoading ||
    isStyleLoading;

  const error =
    nameError || symbolError || configError || totalSupplyError || styleError;

  const collectionDetails: CollectionDetails | undefined =
    name && symbol && config && totalSupply && firstStyle
      ? {
          name,
          symbol,
          config: {
            ptype: Number(config[0]),
            price: config[1],
            maxSupply: Number(config[2]),
            unrevealedUri: config[3],
            creator: config[4],
            registry: config[5],
          },
          styles: [
            {
              weightBp: Number(firstStyle[0]),
              maxSupply: Number(firstStyle[1]),
              minted: Number(firstStyle[2]),
              baseUri: firstStyle[3],
            },
          ],
          totalSupply,
          address: collectionAddress!,
        }
      : undefined;

  return {
    collectionDetails,
    isLoading,
    error: error ? error.message : null,
  };
}

/**
 * Hook to get details for multiple collections
 */
export function useMultipleCollectionDetails(collectionAddresses: Address[]) {
  const contracts = collectionAddresses.map(
    (address) =>
      [
        {
          address,
          abi: ART_PRODUCT_COLLECTION_ABI,
          functionName: "name",
        },
        {
          address,
          abi: ART_PRODUCT_COLLECTION_ABI,
          functionName: "symbol",
        },
        {
          address,
          abi: ART_PRODUCT_COLLECTION_ABI,
          functionName: "config",
        },
        {
          address,
          abi: ART_PRODUCT_COLLECTION_ABI,
          functionName: "totalSupply",
        },
        {
          address,
          abi: ART_PRODUCT_COLLECTION_ABI,
          functionName: "styles",
          args: [BigInt(0)],
        },
      ] as const
  );

  // Flatten the contracts array
  const flattenedContracts = contracts.flat();

  const { data, isLoading, error } = useReadContracts({
    contracts: flattenedContracts,
  });

  // Process the results into collection details
  const collectionDetails: CollectionDetails[] = [];
  if (data && data.length === collectionAddresses.length * 5) {
    for (let i = 0; i < collectionAddresses.length; i++) {
      const nameResult = data[i * 5];
      const symbolResult = data[i * 5 + 1];
      const configResult = data[i * 5 + 2];
      const totalSupplyResult = data[i * 5 + 3];
      const styleResult = data[i * 5 + 4];

      if (
        nameResult.status === "success" &&
        symbolResult.status === "success" &&
        configResult.status === "success" &&
        totalSupplyResult.status === "success" &&
        styleResult.status === "success"
      ) {
        const config = configResult.result as unknown as ConfigResult;
        const style = styleResult.result as unknown as StyleResult;

        collectionDetails.push({
          name: nameResult.result as string,
          symbol: symbolResult.result as string,
          config: {
            ptype: Number(config[0]),
            price: config[1],
            maxSupply: Number(config[2]),
            unrevealedUri: config[3],
            creator: config[4],
            registry: config[5],
          },
          styles: [
            {
              weightBp: Number(style[0]),
              maxSupply: Number(style[1]),
              minted: Number(style[2]),
              baseUri: style[3],
            },
          ],
          totalSupply: totalSupplyResult.result as bigint,
          address: collectionAddresses[i],
        });
      }
    }
  }

  return {
    collectionDetails,
    isLoading,
    error: error ? error.message : null,
  };
}
