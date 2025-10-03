import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { COLLECTION_FACTORY_ADDRESS } from "../config/addresses";
import type { CreateCollectionParams } from "../types/contracts";

const COLLECTION_FACTORY_ABI = parseAbi([
  "function createCollection(string name, string symbol, (uint8 ptype, uint256 price, uint32 maxSupply, string unrevealedUri, address creator, address registry) config, (uint16 weightBp, uint32 maxSupply, uint32 minted, string baseUri)[] styles) returns (address collection)",
]);

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
