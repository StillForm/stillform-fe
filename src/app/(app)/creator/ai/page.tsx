import { Suspense } from "react";
import { AiStudioView } from "@/components/pages/ai-studio-view";

export default function CreatorAiPage() {
  return (
    <Suspense fallback={null}>
      <AiStudioView />
    </Suspense>
  );
}
