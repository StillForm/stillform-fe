# 项目智能合约场景化运行逻辑

本文档通过不同场景的详细分步解释，帮助开发者理解本项目中各个智能合约是如何协同工作的。

## 场景一：平台初始化与配置

**目标**：平台所有者部署并配置核心合约，为创作者和用户准备好基础环境。

1.  **部署 `PlatformRegistry`**:
    *   平台管理员首先部署 `PlatformRegistry` 合约。
    *   部署时，构造函数会将部署者地址设为 `DEFAULT_ADMIN_ROLE`，授予其最高管理权限。

2.  **部署 `PrimaryMarket`**:
    *   管理员部署 `PrimaryMarket` 合约，并在构造函数中传入 `PlatformRegistry` 合约的地址。这使得 `PrimaryMarket` 知道去哪里读取平台配置。

3.  **配置 `PlatformRegistry`**:
    *   管理员调用 `PlatformRegistry` 的 `setPrimaryMarket()` 函数，将刚刚部署的 `PrimaryMarket` 合约地址注册进去。这是关键一步，确保了只有官方市场才能触发铸造。
    *   管理员调用 `setFeeRecipient()` 函数，设置平台收取手续费的钱包地址。
    *   管理员调用 `setPlatformFeeBp()` 函数，设置在一级市场销售中的抽成比例（例如，设置为 `500` 代表 5%）。

## 场景二：创作者创建新的 NFT 系列

**目标**：一位艺术家（创作者）希望在平台上发布一个新的 NFT 系列。

1.  **部署 `CollectionFactory`** (通常由平台方完成):
    *   平台方部署 `CollectionFactory` 合约，构造函数中传入 `PlatformRegistry` 的地址。

2.  **创作者调用 `createCollection`**:
    *   创作者调用 `CollectionFactory` 合约的 `createCollection` 函数。
    *   **传入参数**:
        *   `name`: NFT 系列的名称 (例如, "My Art Series").
        *   `symbol`: NFT 的代号 (例如, "ART").
        *   `config`: 一个结构体，包含：
            *   `ptype`: 产品类型（例如 `ProductType.BLINDBOX`）。
            *   `price`: 每个 NFT 的售价（以 wei 为单位）。
            *   `maxSupply`: 系列的最大供应量。
            *   `unrevealedUri`: 如果是盲盒，则为揭示前的统一元数据 URI。
            *   `creator`: 创作者的钱包地址，用于接收销售收益。
            *   `registry`: `PlatformRegistry` 合约地址。
        *   `styles`: 一个样式数组，如果是盲盒，则包含不同样式的元数据 URI 和权重。
    *   `CollectionFactory` 内部会进行参数验证（例如，检查盲盒样式的权重总和是否为 10000）。
    *   `CollectionFactory` 使用 `new` 关键字部署一个新的 `ArtProductCollection` 合约实例，并将创作者地址设为管理员和经理。
    *   函数返回新创建的 `ArtProductCollection` 合约地址。
    *   触发 `CollectionCreated` 事件，方便链下服务索引。

## 场景三：用户在一级市场购买 NFT (懒惰铸造)

**目标**：一位用户看中了一个 NFT 系列，并决定购买。

1.  **用户调用 `purchase`**:
    *   用户（买家）调用 `PrimaryMarket` 合约的 `purchase` 函数。
    *   **传入参数**:
        *   `collectionAddress`: 用户想要购买的那个 `ArtProductCollection` 合约地址。
    *   **支付 ETH**: 用户在调用函数时，必须发送与 NFT 价格完全相符的 ETH (`msg.value`)。

2.  **`PrimaryMarket` 处理购买**:
    *   合约首先通过 `collectionAddress` 找到对应的 `ArtProductCollection` 实例。
    *   它会读取该 `ArtProductCollection` 的 `config`，获取价格、创作者地址等信息。
    *   验证 `msg.value` 是否等于 `config.price`。如果不是，则交易失败。

3.  **触发懒惰铸造**:
    *   验证通过后，`PrimaryMarket` 调用 `ArtProductCollection` 的 `primaryMintTo` 函数，并将买家地址 (`msg.sender`) 作为参数传入。
    *   `ArtProductCollection` 的 `primaryMintTo` 函数会进行权限检查，确保调用者是已在 `PlatformRegistry` 中注册的 `PrimaryMarket` 合约。
    *   检查通过后，它会铸造一个新的 NFT（`_nextTokenId` 增加），并将所有权赋予买家。
    *   `primaryMintTo` 函数返回新铸造的 `tokenId` 给 `PrimaryMarket`。

4.  **资金分配**:
    *   `PrimaryMarket` 从 `PlatformRegistry` 读取平台费率 (`getPlatformFeeBp`)。
    *   根据费率计算平台手续费和创作者应得的收益。
    *   使用 `.call{value: ...}` 将资金分别转入平台手续费接收地址和创作者地址。
    *   如果转账失败，整个交易将回滚。

5.  **完成**:
    *   触发 `Sale` 事件，记录本次交易的详细信息。
    *   买家在其钱包中收到一个新的 NFT。

## 场景四：用户揭示盲盒 NFT

**目标**：用户购买了一个盲盒 NFT，现在想知道它到底是什么样子。

1.  **用户调用 `reveal`**:
    *   NFT 的所有者调用其持有的 `ArtProductCollection` 合约的 `reveal` 函数。
    *   **传入参数**: `tokenId`，他们想要揭示的 NFT ID。

2.  **`ArtProductCollection` 处理揭示**:
    *   合约验证调用者 (`_msgSender()`) 是否是该 `tokenId` 的所有者。
    *   验证该系列是否是盲盒类型 (`config.ptype == DataStructures.ProductType.BLINDBOX`)。
    *   验证该 NFT 是否尚未被揭示 (`isRevealed[tokenId]` 为 `false`)。
    *   合约内部使用一个简单的伪随机算法（基于 `block.timestamp`, `msg.sender`, `tokenId`）来确定最终样式。**注意：这在生产环境中是不安全的，未来会被 Chainlink VRF 替代。**
    *   根据随机结果，为该 `tokenId` 关联一个 `style` (`tokenStyle[tokenId] = ...`)。
    *   将 `isRevealed[tokenId]` 设为 `true`。

3.  **更新元数据**:
    *   在此之后，当任何人查询该 `tokenId` 的 `tokenUri` 时，函数将不再返回统一的 `unrevealedUri`，而是根据其揭示出的 `style` 构造并返回最终的元数据 URI。

## 场景五：NFT 实物化流程

**目标**：将一个数字 NFT 兑换成实体艺术品，并将其锁定，变为灵魂绑定代币 (SBT)。

1.  **持有者申请实物化**:
    *   NFT 所有者调用 `ArtProductCollection` 的 `requestPhysicalization` 函数，并传入 `tokenId`。
    *   合约将该 `tokenId` 的 `physicalizationStatus` 从 `NONE` 更新为 `REQUESTED`。

2.  **创作者处理申请**:
    *   合集创作者（拥有 `DEFAULT_ADMIN_ROLE` 角色）在后台收到申请（例如通过链下事件监听）。
    *   在开始处理实体物品的交付后，创作者调用 `markProcessing` 函数，将状态更新为 `PROCESSING`。

3.  **创作者完成交付**:
    *   当实体艺术品成功交付给持有者后，创作者调用 `completePhysicalization` 函数。
    *   可以传入一个 `finalUri`，永久性地更新该 NFT 的元数据，例如指向一个包含实体艺术品信息的数字证书。
    *   合约将 `physicalizationStatus` 更新为 `COMPLETED`。

4.  **NFT 锁定**:
    *   一旦状态变为 `COMPLETED`，`locked(tokenId)` 函数将返回 `true`。
    *   合约覆写了 `_update` 函数，这是 ERC-721 中负责所有权转移的核心内部函数。当 `locked(tokenId)` 为 `true` 时，`_update` 会直接回滚交易，从而阻止任何形式的转移（`transfer`, `safeTransferFrom`, `approve` 等）。
    *   此时，该 NFT 已成为一个不可转让的灵魂绑定代币。
