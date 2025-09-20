"use client";

import { useMemo } from "react";
import Image from "next/image";
import { BaseModal } from "@/components/modals/base-modal";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/lib/stores/modal-store";
import { assetDetails, blindBoxReveals, creatorDrafts, aiPresets } from "@/data/mock-data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Asset } from "@/lib/types";
import { logEvent } from "@/lib/analytics";

function AuctionModal({ asset }: { asset: Asset }) {
  const { closeModal } = useModalStore();
  return (
    <BaseModal
      open
      onClose={closeModal}
      title={`Bid on ${asset.title}`}
      description="Set your max bid. Funds stay in your wallet until the auction closes."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="tertiary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              logEvent("auction_bid", { id: asset.id, bid: "4.2" });
              closeModal();
            }}
          >
            Place Bid
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-[16px]">
            <Image src={asset.image} alt={asset.title} fill className="object-cover" />
          </div>
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>Edition</span>
            <span className="text-text-primary">{asset.edition}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>Current Bid</span>
            <span className="text-gold">{asset.highestBid}</span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bid-amount">Bid amount</Label>
            <Input id="bid-amount" placeholder="4.20 ETH" />
          </div>
          <div>
            <Label htmlFor="bid-note" optional>
              Notes
            </Label>
            <Textarea id="bid-note" placeholder="Add a note for the artist" rows={4} />
          </div>
          <div className="rounded-[14px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-4 text-sm text-text-secondary">
            Ensure your wallet is connected and funded. If you win, redemption details unlock within
            Activity.
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

function BlindBoxModal({ asset }: { asset: Asset }) {
  const { closeModal } = useModalStore();
  const reveals = blindBoxReveals;

  return (
    <BaseModal
      open
      onClose={closeModal}
      title={`Open ${asset.title}`}
      description="Each reveal contains a random rarity tier. Physical shards accompany Epic and Legendary tiers."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="tertiary" onClick={closeModal}>
            Close
          </Button>
          <Button
            size="lg"
            onClick={() => {
              logEvent("blind_open", { product_id: asset.id });
              closeModal();
            }}
          >
            Open Capsule
          </Button>
        </div>
      }
      widthClassName="max-w-4xl"
    >
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-[18px]">
            <Image src={asset.image} alt={asset.title} fill className="object-cover" />
          </div>
          <div className="rounded-[14px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-4 text-sm text-text-secondary">
            <div className="flex items-center justify-between">
              <span>Capsule Price</span>
              <span className="text-text-primary">{asset.price}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Physical Reward</span>
              <span className="text-gold">Included</span>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="font-display text-xl text-text-primary">My Reveals</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Capsule reveals sync across devices. Rare tiers trigger redemption prompts.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, index) => {
              const reveal = reveals[index];
              return (
                <div
                  key={index}
                  className="relative flex aspect-square items-center justify-center rounded-[14px] border border-[rgba(207,175,109,0.35)] bg-[rgba(18,18,21,0.75)]"
                >
                  {reveal ? (
                    <>
                      <Image src={reveal.image} alt={reveal.rarity} fill className="object-cover" />
                      <Badge className="absolute bottom-2 left-1/2 -translate-x-1/2" variant="gold">
                        {reveal.rarity}
                      </Badge>
                    </>
                  ) : (
                    <span className="text-sm text-text-secondary/70">Locked</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="rounded-[14px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-4 text-sm text-text-secondary">
            <p className="font-semibold text-text-primary">Global Drops</p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-text-secondary/70">
              Real-time feed
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {blindBoxReveals.map((reveal) => (
                <li key={reveal.id} className="flex items-center justify-between">
                  <span className="text-text-secondary">Collector minted</span>
                  <span className="text-gold">{reveal.rarity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

function WalletPromptModal({ asset }: { asset: Asset }) {
  const { closeModal, openModal } = useModalStore();
  return (
    <BaseModal
      open
      onClose={closeModal}
      title="Connect your wallet"
      description="Connect any supported chain wallet to continue. Stillform does not store your private keys."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              openModal("blindBox", { assetId: asset.id });
            }}
          >
            Preview Blind Box
          </Button>
          <Button
            onClick={() => {
              logEvent("product_action", { type: "buy", id: asset.id, result: "prompt_connect" });
              closeModal();
            }}
          >
            Continue
          </Button>
        </div>
      }
    >
      <p className="text-sm text-text-secondary">
        Choose a wallet from the panel to continue this action. You can link multiple addresses across
        EVM, Solana, and Sui.
      </p>
    </BaseModal>
  );
}

function RedemptionModal({ asset }: { asset: Asset }) {
  const { closeModal } = useModalStore();
  return (
    <BaseModal
      open
      onClose={closeModal}
      title="Request Redemption"
      description="Submit shipping details to receive the paired physical artifact. Our concierge will confirm within 24 hours."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="tertiary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              logEvent("asset_request_redemption", { asset_id: asset.id, result: "submitted" });
              closeModal();
            }}
          >
            Submit Request
          </Button>
        </div>
      }
      widthClassName="max-w-4xl"
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name*</Label>
            <Input id="fullName" placeholder="Aurora Nyx" required />
          </div>
          <div>
            <Label htmlFor="email">Email*</Label>
            <Input id="email" type="email" placeholder="creator@stillform.xyz" required />
          </div>
          <div>
            <Label htmlFor="phone">Phone*</Label>
            <Input id="phone" placeholder="+1 555 032 8899" required />
          </div>
          <div>
            <Label htmlFor="country">Country/Region*</Label>
            <Input id="country" placeholder="United States" required />
          </div>
          <div>
            <Label htmlFor="address1">Address Line 1*</Label>
            <Input id="address1" placeholder="231 Stillform Ave" required />
          </div>
          <div>
            <Label htmlFor="address2" optional>
              Address Line 2
            </Label>
            <Input id="address2" placeholder="Suite 7" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City*</Label>
              <Input id="city" placeholder="New York" required />
            </div>
            <div>
              <Label htmlFor="postal">Postal Code*</Label>
              <Input id="postal" placeholder="10013" required />
            </div>
          </div>
          <div>
            <Label htmlFor="notes" optional>
              Notes for delivery
            </Label>
            <Textarea id="notes" rows={5} placeholder="Delivery instructions, availability window" />
          </div>
          <div className="rounded-[14px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-4 text-sm text-text-secondary">
            <p className="font-semibold text-text-primary">Summary</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span>Item</span>
                <span className="text-text-primary">{asset.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Edition</span>
                <span className="text-text-primary">{asset.edition}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Chain</span>
                <span className="text-text-primary">{asset.chain}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

function CreatorNewModal() {
  const { closeModal } = useModalStore();
  return (
    <BaseModal
      open
      onClose={closeModal}
      title="New work"
      description="Define edition supply, sale format, and redemption rules. You can save drafts and revisit from the studio dashboard."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="tertiary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              logEvent("creator_create", { mode: "new" });
              closeModal();
            }}
          >
            Create draft
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="work-title">Title*</Label>
          <Input id="work-title" placeholder="Enter work title" />
        </div>
        <div>
          <Label htmlFor="work-supply">Edition Supply*</Label>
          <Input id="work-supply" placeholder="Edition of 50" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="work-description">Description*</Label>
          <Textarea id="work-description" rows={4} placeholder="Describe the physical tie-in, materials, and story." />
        </div>
        <div className="md:col-span-2 rounded-[14px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-4 text-sm text-text-secondary">
          Redemption workflows connect to your selected fulfilment partner. Configure shipping cost handoff later.
        </div>
      </div>
    </BaseModal>
  );
}

function CreatorDraftModal({ draftId }: { draftId?: string }) {
  const { closeModal } = useModalStore();
  const draft = draftId ? creatorDrafts.find((item) => item.id === draftId) : undefined;

  return (
    <BaseModal
      open
      onClose={closeModal}
      title={draft ? `Edit ${draft.title}` : "Manage drafts"}
      description="Draft changes autosave. Publish to schedule a drop or send to review."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              logEvent("creator_save_draft", { work_id: draftId });
              closeModal();
            }}
          >
            Save draft
          </Button>
          <Button
            onClick={() => {
              logEvent("creator_publish", { work_id: draftId });
              closeModal();
            }}
          >
            Publish
          </Button>
        </div>
      }
      widthClassName="max-w-3xl"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="draft-title">Title</Label>
          <Input id="draft-title" defaultValue={draft?.title} />
        </div>
        <div>
          <Label htmlFor="draft-edition">Edition</Label>
          <Input id="draft-edition" placeholder="Edition of 50" />
        </div>
        <div>
          <Label htmlFor="draft-notes" optional>
            Notes
          </Label>
          <Textarea id="draft-notes" rows={5} placeholder="Notes for collaborators" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[14px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-4 text-sm text-text-secondary">
            <p className="font-semibold text-text-primary">Sale format</p>
            <p className="mt-2 text-text-secondary">Configure fixed, auction, or blind box once artwork uploads.</p>
          </div>
          <div className="rounded-[14px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-4 text-sm text-text-secondary">
            <p className="font-semibold text-text-primary">Physical fulfilment</p>
            <p className="mt-2 text-text-secondary">Select courier and packaging templates for redemption.</p>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

function AiPresetModal({ source }: { source?: string }) {
  const { closeModal } = useModalStore();
  return (
    <BaseModal
      open
      onClose={closeModal}
      title="Send to AI Studio"
      description="Select a preset to seed the AI assistant. Variants land in your Creator Studio drafts."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="tertiary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              logEvent("ai_set_as_draft", { source });
              closeModal();
            }}
          >
            Send selection
          </Button>
        </div>
      }
      widthClassName="max-w-4xl"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {aiPresets.map((preset) => (
          <div
            key={preset.id}
            className="flex gap-4 rounded-[16px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-4"
          >
            <div className="relative h-24 w-24 overflow-hidden rounded-[12px]">
              <Image src={preset.thumbnail} alt={preset.name} fill className="object-cover" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-text-primary">{preset.name}</h3>
              <p className="text-sm text-text-secondary">{preset.prompt}</p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => logEvent("ai_generate", { source, preset: preset.id })}
              >
                Generate variation
              </Button>
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  );
}

export function ModalsRoot() {
  const { modal, closeModal } = useModalStore();

  const asset = useMemo(() => {
    if (!modal?.payload || !("assetId" in modal.payload)) return undefined;
    return assetDetails[modal.payload.assetId as string];
  }, [modal]);

  if (!modal) return null;

  if (!asset && ["auction", "blindBox", "walletPrompt", "redemption"].includes(modal.type)) {
    closeModal();
    return null;
  }

  switch (modal.type) {
    case "auction":
      return asset ? <AuctionModal asset={asset} /> : null;
    case "blindBox":
      return asset ? <BlindBoxModal asset={asset} /> : null;
    case "walletPrompt":
      return asset ? <WalletPromptModal asset={asset} /> : null;
    case "redemption":
      return asset ? <RedemptionModal asset={asset} /> : null;
    case "creatorNew":
      return <CreatorNewModal />;
    case "creatorDraft":
      return <CreatorDraftModal draftId={modal.payload?.draftId as string | undefined} />;
    case "aiPreset":
      return <AiPresetModal source={modal.payload?.source as string | undefined} />;
    default:
      return null;
  }
}
