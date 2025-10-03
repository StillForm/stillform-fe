import { CreateCollectionParams } from "../types/contracts";

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
