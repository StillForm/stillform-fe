import { Address } from "viem";

// 产品类型枚举
export enum ProductType {
  NORMAL = 0,
  BLINDBOX = 1,
}

// 实物化状态枚举
export enum PhysStatus {
  NONE = 0,
  REQUESTED = 1,
  PROCESSING = 2,
  COMPLETED = 3,
}

// 合集配置结构体
export interface CollectionConfig {
  ptype: ProductType;
  price: bigint;
  maxSupply: number;
  unrevealedUri: string;
  creator: Address;
  registry: Address;
}

// 样式结构体
export interface Style {
  weightBp: number;
  maxSupply: number;
  minted: number;
  baseUri: string;
}

// VRF配置结构体
export interface VRFConfig {
  coordinator: Address;
  keyHash: `0x${string}`;
  subscriptionId: bigint;
  callbackGasLimit: number;
  requestConfirmations: number;
}

// 创建合集参数
export interface CreateCollectionParams {
  name: string;
  symbol: string;
  config: CollectionConfig;
  styles: Style[];
}

// 购买参数
export interface PurchaseParams {
  collectionAddress: Address;
  value: bigint;
}
