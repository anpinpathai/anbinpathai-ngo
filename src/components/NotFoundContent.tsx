import { Button } from "@/components/Button";
import { postText } from "@/content/ta-LK";

export function NotFoundContent() {
  const text = postText.notFound;
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <p className="inline-block rounded-full bg-brand px-8 py-2 font-heading text-5xl font-bold text-gold">404</p>
      <h1 className="mt-4 text-2xl text-brand sm:text-4xl">{text.title}</h1>
      <p className="mt-4 text-base text-muted sm:text-lg">{text.text}</p>
      <div className="mt-8">
        <Button href="/">{text.button}</Button>
      </div>
    </main>
  );
}
