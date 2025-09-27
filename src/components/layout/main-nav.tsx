"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { ChevronDown, Search, WalletMinimal } from "lucide-react";
import { NAV_ITEMS } from "@/data/navigation";
import { profileSummary } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Container } from "@/components/layout/container";
import { cn, truncateAddress } from "@/lib/utils";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useAnalytics, logEvent } from "@/lib/analytics";
import { useWalletContext } from "@/lib/wallet/wallet-context";
import Image from "next/image";

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const trackNavClick = useAnalytics("nav_click");
  const { togglePanel, setPanelOpen, panelOpen } = useWalletStore();
  const { activeWallet } = useWalletContext();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    logEvent("market_search", { q: trimmed });
    router.push(`/market?q=${encodeURIComponent(trimmed)}`);
  };

  const activeWalletAddress = activeWallet?.address ?? "";
  const isConnected = Boolean(activeWalletAddress);
  const hasProfile = isConnected;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent transition-[background,backdrop-filter,border-color] duration-300",
        scrolled
          ? "border-[rgba(38,39,43,0.75)] bg-[rgba(10,10,11,0.9)]/95 backdrop-blur-xl"
          : "bg-transparent backdrop-blur-0"
      )}
    >
      <Container className="flex h-20 items-center justify-between gap-6">
        <div className="flex items-center gap-12">
          {/* <Link
            href="/"
            className="flex items-center gap-3 text-lg font-semibold tracking-wide text-text-primary"
            onClick={() => trackNavClick({ menu: "logo" })}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[radial-gradient(circle_at_30%_20%,rgba(230,195,106,0.55),rgba(26,20,36,0.95))] text-2xl font-bold text-canvas">
              S
            </span>
            Stillform
          </Link> */}
          <Image
            src="/images/transparent-bg-logo.png"
            alt="logo"
            width={100}
            height={100}
          />

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative pb-1 text-sm font-medium text-text-secondary transition",
                    isActive &&
                      "text-text-primary after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-gold",
                    !isActive && "hover:text-text-primary"
                  )}
                  onClick={() => trackNavClick({ menu: item.analyticsId })}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <form
            onSubmit={handleSearchSubmit}
            className="hidden max-w-sm flex-1 items-center gap-3 rounded-[12px] border border-[rgba(38,39,43,0.85)] bg-[rgba(12,12,14,0.78)] px-4 py-2 text-sm text-text-secondary transition focus-within:border-[rgba(207,175,109,0.65)] focus-within:shadow-[0_0_0_1px_rgba(207,175,109,0.3)] sm:flex"
          >
            <Search className="h-4 w-4" />
            <input
              type="search"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search artworks, creators"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={activeWallet ? "secondary" : "primary"}
              className={cn(
                "group inline-flex min-w-[140px] items-center justify-center gap-3",
                hasProfile && "pr-2"
              )}
              onClick={() => {
                trackNavClick({ menu: "wallet" });
                if (hasProfile) {
                  setPanelOpen(false);
                  router.push(`/profile/${profileSummary.handle}`);
                  return;
                }
                togglePanel();
              }}
            >
              {hasProfile ? (
                <>
                  <Avatar
                    src={profileSummary.avatar}
                    alt={profileSummary.handle}
                    size={36}
                    className="border-transparent"
                  />
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-xs uppercase tracking-[0.28em] text-text-secondary/70">
                      Connected
                    </span>
                    <span className="text-sm font-semibold text-text-primary">
                      @{profileSummary.handle}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <WalletMinimal className="h-4 w-4" />
                  {isConnected
                    ? truncateAddress(activeWalletAddress)
                    : "Connect Wallet"}
                </>
              )}
            </Button>

            {hasProfile ? (
              <button
                type="button"
                onClick={() => {
                  trackNavClick({ menu: "wallet" });
                  togglePanel();
                }}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-[12px] border border-[rgba(38,39,43,0.6)] bg-[rgba(12,12,14,0.78)] transition",
                  panelOpen
                    ? "border-[rgba(207,175,109,0.6)] text-gold"
                    : "text-text-secondary hover:border-[rgba(207,175,109,0.45)] hover:text-text-primary"
                )}
                aria-label={
                  panelOpen ? "Collapse wallet panel" : "Expand wallet panel"
                }
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    panelOpen && "rotate-180"
                  )}
                />
              </button>
            ) : null}
          </div>
        </div>
      </Container>
    </header>
  );
}
