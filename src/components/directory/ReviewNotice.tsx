import { PageHeader } from "@/components/PageHeader";
import { directory } from "@/content/ta-LK";

// The page a reviewer sees when the link does not work any more (cancelled, over, or not a real link).
export function ReviewNotice({ title, message }: { title: string; message: string }) {
  return (
    <main>
      <PageHeader title={title} crumb={directory.review.title} />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="rounded-3xl border border-line bg-white p-8 text-center text-lg text-ink shadow-sm">{message}</p>
      </div>
    </main>
  );
}
