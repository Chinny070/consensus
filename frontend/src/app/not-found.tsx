import Link from "next/link";
import { StampedButton } from "@/components/ui/StampedButton";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="font-mono text-6xl text-ink-800 mb-4">404</div>
        <h1 className="text-2xl font-display mb-4">
          This agreement does not exist.
        </h1>
        <p className="text-ink-800 mb-8">
          The page you are looking for has not been forged.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <StampedButton variant="ghost">Home</StampedButton>
          </Link>
          <Link href="/forge">
            <StampedButton variant="acid">Forge an agreement</StampedButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
