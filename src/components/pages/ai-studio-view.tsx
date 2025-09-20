"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { aiPresets } from "@/data/mock-data";
import { useAnalytics } from "@/lib/analytics";

const styles = ["Neo Noir", "Velvet Glow", "Swiss Grid"];
const palettes = ["Dark Purple", "Aurora", "Monochrome"];
const resolutions = ["1024x1024", "1024x1536", "1536x1024"];

export function AiStudioView() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState(
    searchParams.get("from") ? `Inspired by ${searchParams.get("from")}` : "Hyper-real crystal installation"
  );
  const [style, setStyle] = useState(styles[0]);
  const [palette, setPalette] = useState(palettes[0]);
  const [resolution, setResolution] = useState(resolutions[0]);
  const [variants, setVariants] = useState("4");
  const [selected, setSelected] = useState<string[]>([]);
  const trackGenerate = useAnalytics("ai_generate");
  const trackSetDraft = useAnalytics("ai_set_as_draft");

  const toggleSelection = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <Container className="space-y-10 py-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-text-secondary/70">AI assistant</p>
          <h1 className="mt-3 font-display text-4xl text-text-primary">Generate lighting boards</h1>
          <p className="mt-2 max-w-2xl text-text-secondary">
            Tailor prompting to Stillform&apos;s dark purple gold aesthetic. Selected variants can sync back
            into your Creator Studio drafts as references.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              trackSetDraft({ source: "ai", selected: selected.length });
            }}
            disabled={selected.length === 0}
          >
            Set as Draft ({selected.length})
          </Button>
          <Button variant="tertiary" disabled={selected.length === 0}>
            Refine
          </Button>
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <Card className="space-y-6">
          <div>
            <label className="text-sm font-medium text-text-secondary" htmlFor="prompt">
              Prompt
            </label>
            <Textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-text-secondary" htmlFor="style">
                Style
              </label>
              <Select id="style" value={style} onChange={(event) => setStyle(event.target.value)}>
                {styles.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary" htmlFor="palette">
                Palette
              </label>
              <Select
                id="palette"
                value={palette}
                onChange={(event) => setPalette(event.target.value)}
              >
                {palettes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary" htmlFor="resolution">
                Resolution
              </label>
              <Select
                id="resolution"
                value={resolution}
                onChange={(event) => setResolution(event.target.value)}
              >
                {resolutions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary" htmlFor="variants">
                Variants
              </label>
              <Input
                id="variants"
                value={variants}
                onChange={(event) => setVariants(event.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={() => {
              trackGenerate({ source: "creator", prompt, style, palette, resolution, variants });
            }}
          >
            Generate
          </Button>
        </Card>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-text-secondary">Presets</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {aiPresets.map((preset) => (
                <Card key={preset.id} interactive className="flex gap-4 p-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-[12px]">
                    <Image src={preset.thumbnail} alt={preset.name} fill className="object-cover" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-text-primary">{preset.name}</p>
                    <p className="text-xs text-text-secondary">{preset.prompt}</p>
                    <Button
                      size="sm"
                      variant="tertiary"
                      onClick={() => setPrompt(preset.prompt)}
                    >
                      Use Prompt
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-text-secondary">Results</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {aiPresets.map((preset) => (
                <button
                  key={`result-${preset.id}`}
                  type="button"
                  onClick={() => toggleSelection(preset.id)}
                  className={`relative overflow-hidden rounded-[16px] border p-0 transition ${
                    selected.includes(preset.id)
                      ? "border-[rgba(207,175,109,0.6)] shadow-[0_0_24px_rgba(207,175,109,0.25)]"
                      : "border-[rgba(38,39,43,0.75)]"
                  }`}
                >
                  <Image src={preset.thumbnail} alt={preset.name} width={400} height={400} className="h-full w-full object-cover" />
                  {selected.includes(preset.id) ? (
                    <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs text-canvas">
                      Selected
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
