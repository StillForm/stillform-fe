export type Chain = "EVM" | "Solana" | "Sui";
export type Network = "Mainnet" | "Testnet";

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
  description?: string;
  followers?: number;
}

export type SaleType = "fixed" | "auction" | "blind";

export interface Asset {
  id: string;
  title: string;
  edition: string;
  chain: Chain;
  saleType: SaleType;
  price?: string;
  highestBid?: string;
  endTime?: string;
  image: string;
  thumbnail?: string;
  artist: Artist;
  rarity?: "Common" | "Rare" | "Epic" | "Legendary";
  description?: string;
  attributes?: Array<{ label: string; value: string }>;
  provenance?: Array<{ tx: string; date: string; owner: string }>;
  activity?: Array<{
    type: "sale" | "bid" | "listing" | "redemption" | "mint";
    from: string;
    to?: string;
    value?: string;
    timestamp: string;
  }>;
}

export interface BlindBoxReveal {
  id: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  image: string;
  revealedAt: string;
}

export interface ActivityEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  icon?: string;
}

export interface MarketFilters {
  categories: string[];
  saleTypes: SaleType[];
  priceRange?: [number, number];
  chains: Chain[];
  sort: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  analyticsId: "marketplace" | "creator" | "wallet" | "logo";
}

export interface CreatorCollection {
  id: string;
  title: string;
  cover: string;
  stats: {
    items: number;
    floorPrice: string;
    volume: string;
    listed: number;
  };
}

export interface CreatorDraft {
  id: string;
  title: string;
  thumbnail: string;
  updatedAt: string;
  status: "draft" | "inReview" | "published";
}

export interface CreatorWorkflow {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ProfileSummary {
  id: string;
  handle: string;
  address: string;
  coverImage: string;
  avatar: string;
  bio: string;
  stats: {
    collectibles: number;
    created: number;
    redeemed: number;
    followers: number;
    following: number;
  };
  socials: Array<{ platform: string; url: string }>;
}

export interface RedemptionForm {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  notes?: string;
}

export interface AiPreset {
  id: string;
  name: string;
  prompt: string;
  thumbnail: string;
}
