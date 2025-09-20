import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface StateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: StateProps) {
  return (
    <Card className="space-y-3 text-center">
      <h3 className="font-display text-xl text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
      {actionLabel ? (
        <Button variant="tertiary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}

export function ErrorState({ title, description, actionLabel, onAction }: StateProps) {
  return (
    <Card className="space-y-3 text-center border border-danger/50">
      <h3 className="font-display text-xl text-danger">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
      {actionLabel ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}

export function LoadingState({ title, description }: Pick<StateProps, "title" | "description">) {
  return (
    <Card className="space-y-3 text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      <h3 className="font-display text-xl text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
    </Card>
  );
}
