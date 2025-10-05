import type {
  AiPreset,
  Asset,
  BlindBoxReveal,
  CreatorCollection,
  CreatorDraft,
  ProfileSummary,
} from "@/lib/types";

export const featuredArtists = [
  {
    id: "artist-aurora",
    name: "Aurora Nyx",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
    verified: true,
    description: "Sculpting surreal botanicals from liquid light",
    followers: 28400,
  },
  {
    id: "artist-etienne",
    name: "Etienne Nova",
    avatar:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=160&q=80",
    verified: true,
    description: "Neo-noir material studies across multichain",
    followers: 18700,
  },
  {
    id: "artist-liu",
    name: "Liu Cyan",
    avatar:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=160&q=80",
    verified: false,
    description: "Translating guangxi minerals into tokenised motion",
    followers: 9600,
  },
];

export const trendingDrops: Asset[] = [
  {
    id: "drop-ethereal-37",
    title: "Ethereal No.37",
    edition: "Edition of 77",
    chain: "EVM",
    saleType: "auction",
    highestBid: "3.84 ETH",
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    image:
      "https://images.unsplash.com/photo-1526312426976-f4d754fa9bd6?auto=format&fit=crop&w=1200&q=80",
    artist: featuredArtists[0],
    rarity: "Rare",
    description:
      "Forged within the polarized chambers of Nyx's analog vault, Ethereal No.37 translates prismatic crystallography into luminous resonance.",
    attributes: [
      { label: "Medium", value: "Crystal Alloy" },
      { label: "Year", value: "2025" },
    ],
  },
  {
    id: "drop-velvet",
    title: "Velvet Prism",
    edition: "1 of 1",
    chain: "Solana",
    saleType: "fixed",
    price: "980 SOL",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    artist: featuredArtists[1],
    rarity: "Epic",
    description:
      "An obsidian bloom anchored in microgravity, inviting collectors into Etienne's velvet fractal series.",
    attributes: [
      { label: "Medium", value: "Velvet Crystal" },
      { label: "Palette", value: "Spectral" },
    ],
  },
  {
    id: "drop-blind",
    title: "Obsidian Bloom Capsule",
    edition: "500 Capsules",
    chain: "EVM",
    saleType: "blind",
    price: "0.22 ETH",
    image:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    artist: featuredArtists[2],
    description:
      "Limited blind capsule co-crafted with the Kaiwu guild, each reveal unlocks a companion physical shard.",
    attributes: [
      { label: "Capsule", value: "Obsidian Bloom" },
      { label: "Rewards", value: "Physical shard" },
    ],
  },
];

export const marketAssets: Asset[] = [
  ...trendingDrops,
  {
    id: "drop-aurora",
    title: "Aurora Bloom",
    edition: "Edition of 32",
    chain: "Sui",
    saleType: "auction",
    highestBid: "1,980 SUI",
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    image:
      "https://images.unsplash.com/photo-1516571137133-1be29e37143a?auto=format&fit=crop&w=1200&q=80",
    artist: featuredArtists[0],
    rarity: "Legendary",
    description:
      "A suspended aurora field captured over fractal micro-sculptures, minted with dual provenance.",
    attributes: [
      { label: "Medium", value: "Aurora Glass" },
      { label: "Palette", value: "Nebula" },
    ],
  },
  {
    id: "drop-cascade",
    title: "Cascade of Ions",
    edition: "Edition of 12",
    chain: "EVM",
    saleType: "fixed",
    price: "6.5 ETH",
    image:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
    artist: featuredArtists[1],
    rarity: "Rare",
    description:
      "Ionic cascades refracted through analog prisms, each purchase includes physical etching rights.",
    attributes: [
      { label: "Medium", value: "Ion Glass" },
      { label: "Palette", value: "Crimson" },
    ],
  },
];

export const globalActivity = [
  {
    id: "act-1",
    type: "blind_open",
    description: "User Aura opened a Rare Obsidian Bloom",
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: "act-2",
    type: "auction_bid",
    description: "Nova placed 3.9 ETH bid on Ethereal No.37",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "act-3",
    type: "product_action",
    description: "Kenji redeemed Velvet Prism physical",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
];

export const blindBoxReveals: BlindBoxReveal[] = [
  {
    id: "reveal-1",
    rarity: "Rare",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80",
    revealedAt: new Date().toISOString(),
  },
  {
    id: "reveal-2",
    rarity: "Epic",
    image:
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=80",
    revealedAt: new Date().toISOString(),
  },
];

export const creatorCollections: CreatorCollection[] = [
  {
    id: "collection-still",
    title: "Stillness Studies",
    cover:
      "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?auto=format&fit=crop&w=1200&q=80",
    stats: {
      items: 48,
      floorPrice: "1.2 ETH",
      volume: "384 ETH",
      listed: 12,
    },
  },
  {
    id: "collection-velvet",
    title: "Velvet Architects",
    cover:
      "https://images.unsplash.com/photo-1526481280695-3c469ef2cf65?auto=format&fit=crop&w=1200&q=80",
    stats: {
      items: 72,
      floorPrice: "620 SOL",
      volume: "16.4K SOL",
      listed: 21,
    },
  },
];

export const creatorDrafts: CreatorDraft[] = [
  {
    id: "draft-1",
    title: "Liquid Fragments",
    thumbnail:
      "https://images.unsplash.com/photo-1448541981804-3f3354f2abf6?auto=format&fit=crop&w=400&q=80",
    updatedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    status: "draft",
  },
  {
    id: "draft-2",
    title: "Suspended Archive",
    thumbnail:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=80",
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: "inReview",
  },
];

export const profileSummary: ProfileSummary = {
  id: "profile-aurora",
  handle: "aurora.nyx",
  address: "0x12c4E98B819c5497983AB42fF119d8Df671249d2",
  coverImage:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1440&q=80",
  avatar:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
  bio: "Kaiwu founding artist focusing on synesthetic lightforms bridging Solana and EVM editions.",
  stats: {
    collectibles: 124,
    created: 68,
    redeemed: 32,
    followers: 42000,
    following: 210,
  },
  socials: [
    { platform: "Twitter", url: "https://x.com/auroranyx" },
    { platform: "Lens", url: "https://hey.xyz/u/aurora" },
  ],
};

export const aiPresets: AiPreset[] = [
  {
    id: "preset-cabinet",
    name: "Cabinet Lighting",
    prompt:
      "Luminous cabinet display for sculpted crystals, cinematic lighting, volumetric fog",
    thumbnail:
      "https://images.unsplash.com/photo-1533094602577-198d3beab8c0?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "preset-velvet",
    name: "Velvet Glow",
    prompt: "Deep velvet textures with golden rim light, high contrast",
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "preset-swiss",
    name: "Swiss Grid",
    prompt: "Brutalist swiss grid layout for art poster, gold accent",
    thumbnail:
      "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "preset-dark",
    name: "Dark Purple Gold",
    prompt: "Dark purple stage with golden volumetric lighting",
    thumbnail:
      "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&w=400&q=80",
  },
];

export const profileAssets = marketAssets.slice(0, 4);

export const profileActivity = [
  {
    id: "prof-act-1",
    type: "sale",
    description: "Sold Ethereal No.37 to Nova for 4.0 ETH",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "prof-act-2",
    type: "redemption",
    description: "Collector Kenji requested redemption for Velvet Prism",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "prof-act-3",
    type: "auction",
    description: "New bid 3.85 ETH placed on Aurora Bloom",
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

export const assetDetails: Record<string, Asset> = Object.fromEntries(
  marketAssets.map((asset, index) => {
    const createdAt = Date.now() - index * 1000 * 60 * 60;
    return [
      asset.id,
      {
        ...asset,
        description:
          asset.description ??
          "A physical-digital paired collectible minted through the Kaiwu studio, complete with redemption rights.",
        attributes: asset.attributes ?? [
          { label: "Medium", value: "Crystal Alloy" },
          { label: "Year", value: "2025" },
          { label: "Physical", value: "Included" },
        ],
        provenance: [
          {
            tx: "0x9f83...24c1",
            date: new Date(createdAt).toISOString(),
            owner: asset.artist.name,
          },
          {
            tx: "0xb841...ebcd",
            date: new Date(createdAt + 1000 * 60 * 15).toISOString(),
            owner: "Kaiwu Vault",
          },
        ],
        activity: [
          {
            type: "listing",
            from: asset.artist.name,
            value: asset.price ?? asset.highestBid ?? "",
            timestamp: new Date(createdAt + 1000 * 60 * 30).toISOString(),
          },
          {
            type: asset.saleType === "auction" ? "bid" : "sale",
            from: "Collector Nova",
            to: "Auction Pool",
            value: asset.highestBid ?? asset.price ?? "",
            timestamp: new Date(createdAt + 1000 * 60 * 45).toISOString(),
          },
        ],
      },
    ];
  })
);
