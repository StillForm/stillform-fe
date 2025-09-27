# Stillform 智能合约接口说明文档

本文档为 Stillform 平台核心智能合约的外部接口提供了详细说明。主要面向需要与这些合约进行交互的前端开发者、后端服务或其他智能合约的开发者。

## 核心合约地址

所有合约的最新部署地址都可以在 `addresses.json` 文件中找到。

---

## 1. PlatformRegistry

**功能**: 平台的中央注册表，用于存储和管理所有核心配置和关键合约的地址。这是一个由管理员控制的合约。

### 主要函数 (Methods)

#### `getPrimaryMarket() → address`
*   **功能**: 获取当前一级市场（`PrimaryMarket`）合约的地址。
*   **调用权限**: 任何人。
*   **返回**: `address` - `PrimaryMarket` 合约的地址。

#### `getFeeRecipient() → address`
*   **功能**: 获取接收平台费用的钱包地址。
*   **调用权限**: 任何人。
*   **返回**: `address` - 平台费用接收地址。

#### `getPlatformFeeBp() → uint96`
*   **功能**: 获取平台费用的费率，以基点（Basis Points）表示。
*   **调用权限**: 任何人。
*   **返回**: `uint96` - 平台费率（例如, `500` 代表 5%）。

---

## 2. CollectionFactory

**功能**: 用于创建新的 NFT 合集（`ArtProductCollection`）的工厂合约。

### 主要函数 (Methods)

#### `createCollection(string name, string symbol, tuple config, tuple[] styles) → address`
*   **功能**: 部署一个新的 `ArtProductCollection` 合约。这是平台创建新 NFT 项目的入口点。
*   **调用权限**: 任何人（代表创作者）。`msg.sender` 将被设为新合集的管理员。
*   **参数**:
    *   `name`: `string` - 新 NFT 合集的名称 (例如, "My Awesome Collection")。
    *   `symbol`: `string` - 新 NFT 合集的代号 (例如, "MAC")。
    *   `config`: `tuple` - 合集的配置结构体 `DataStructures.CollectionConfig`。
        *   `ptype`: `uint8` - 产品类型 (`0` for NORMAL, `1` for BLINDBOX)。
        *   `price`: `uint256` - 单个 NFT 的价格 (以 wei 为单位)。
        *   `maxSupply`: `uint32` - 合集的最大供应量。
        *   `unrevealedUri`: `string` - （仅盲盒需要）未揭示状态下的元数据 URI。
        *   `creator`: `address` - 接收销售收入的创作者地址。
        *   `registry`: `address` - `PlatformRegistry` 合约的地址。
    *   `styles`: `tuple[]` - 样式的数组 `DataStructures.Style[]`。
        *   对于 `NORMAL` 类型，通常只提供一个 style。
        *   对于 `BLINDBOX` 类型，必须提供至少两个 styles，且其 `weightBp` 总和必须为 `10000`。
*   **返回**: `address` - 新部署的 `ArtProductCollection` 合约的地址。

---

## 3. PrimaryMarket

**功能**: 处理所有 NFT 一级销售的合约。用户通过与此合约交互来购买新的 NFT。

### 主要函数 (Methods)

#### `purchase(address collectionAddress)`
*   **功能**: 从指定的 `ArtProductCollection` 合集中购买（铸造）一个新的 NFT。
*   **调用权限**: 任何人（代表买家）。
*   **交易价值**: 必须发送**等于**该合集 NFT 价格的 ETH (`msg.value`)。
*   **参数**:
    *   `collectionAddress`: `address` - 目标 `ArtProductCollection` 合约的地址。

---

## 4. ArtProductCollection

**功能**: 核心的 NFT 合约 (ERC721)，代表一个具体的 NFT 项目。

### 主要函数 (Methods)

#### `config() → tuple`
*   **功能**: 获取此合集的完整配置信息。
*   **调用权限**: 任何人。
*   **返回**: `tuple` - 包含所有 `DataStructures.CollectionConfig` 成员的值。

#### `tokenUri(uint256 tokenId) → string`
*   **功能**: 获取指定 `tokenId` 的元数据 URI，符合 ERC721 Metadata 标准。
*   **调用权限**: 任何人。
*   **返回**: `string` - 元数据 JSON 文件的 URI。
    *   对于盲盒，在揭示前返回 `unrevealedUri`。
    *   揭示后或对于普通 NFT，返回其对应样式的 URI。
    *   如果已实体化并设置了最终 URI，则返回最终 URI。

#### `reveal(uint256 tokenId)`
*   **功能**: （仅盲盒需要）揭示一个 NFT，为其随机分配一个样式。
*   **调用权限**: 仅限 `tokenId` 的所有者。

#### `ownerOf(uint256 tokenId) → address`
*   **功能**: 获取指定 `tokenId` 的所有者地址。
*   **调用权限**: 任何人。
*   **返回**: `address` - NFT 的所有者地址。

#### `balanceOf(address owner) → uint256`
*   **功能**: 查询一个地址拥有此合集中 NFT 的数量。
*   **调用权限**: 任何人。
*   **返回**: `uint256` - 拥有的 NFT 数量。

#### `requestPhysicalization(uint256 tokenId)`
*   **功能**: (实物化) 允许 NFT 的所有者发起将其数字藏品兑换为实物的请求。
*   **调用权限**: 仅限 `tokenId` 的所有者。
*   **状态变更**: 将该 NFT 的 `physicalizationStatus` 设置为 `REQUESTED`。

#### `markProcessing(uint256 tokenId)`
*   **功能**: (实物化) 允许合集创作者将实物化请求标记为“处理中”。
*   **调用权限**: 仅限合集创作者 (`DEFAULT_ADMIN_ROLE`)。
*   **状态变更**: 将该 NFT 的 `physicalizationStatus` 设置为 `PROCESSING`。

#### `completePhysicalization(uint256 tokenId, string finalUri)`
*   **功能**: (实物化) 允许合集创作者将实物化流程标记为“完成”。此操作会永久锁定该 NFT，使其无法再被转移，并可以选择性地为其设置一个最终的元数据 URI。
*   **调用权限**: 仅限合集创作者 (`DEFAULT_ADMIN_ROLE`)。
*   **参数**:
    *   `tokenId`: `uint256` - 需要最终确定的 NFT 的 ID。
    *   `finalUri`: `string` - (可选) 锁定后 NFT 的永久元数据 URI。
*   **状态变更**: 将该 NFT 的 `physicalizationStatus` 设置为 `COMPLETED`，并永久锁定。
