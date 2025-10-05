src/lib/contracts/
├── index.ts                           # 主导出文件
├── doc/                              # 文档和ABI文件 (已存在)
│   ├── addresses.json
│   ├── InterfaceGuide.md
│   ├── contract_interaction_scenarios.md
│   └── abis/
│       ├── ArtProductCollection.abi.json
│       ├── CollectionFactory.abi.json
│       ├── PlatformRegistry.abi.json
│       └── PrimaryMarket.abi.json
├── types/                            # TypeScript类型定义
│   ├── contracts.ts                  # 合约接口类型
│   └── common.ts                     # 通用类型
├── config/                           # 配置文件
│   └── addresses.ts                  # 合约地址配置
├── platform-registry/               # PlatformRegistry合约调用函数
│   ├── getPrimaryMarket.ts
│   ├── getFeeRecipient.ts
│   ├── getPlatformFeeBp.ts
│   ├── getVRFConfig.ts
│   ├── setPrimaryMarket.ts
│   ├── setFeeRecipient.ts
│   ├── setPlatformFeeBp.ts
│   └── setVRFConfig.ts
├── collection-factory/              # CollectionFactory合约调用函数
│   └── createCollection.ts
├── primary-market/                  # PrimaryMarket合约调用函数
│   └── purchase.ts
└── art-product-collection/         # ArtProductCollection合约调用函数
    ├── config.ts
    ├── tokenURI.ts
    ├── ownerOf.ts
    ├── balanceOf.ts
    ├── reveal.ts
    ├── requestPhysicalization.ts
    ├── markProcessing.ts
    ├── completePhysicalization.ts
    ├── locked.ts
    ├── physicalizationStatus.ts
    ├── isRevealed.ts
    ├── tokenStyle.ts
    ├── styles.ts
    └── totalSupply.ts