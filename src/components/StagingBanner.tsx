// A strip at the very top of every page of the test (staging) copy, so nobody mistakes it for the real website.
export function StagingBanner() {
  return (
    <div role="note" lang="en" className="bg-amber-400 px-3 py-1 text-center text-xs font-bold tracking-wide text-black">
      STAGING · test copy of the website · not the real site
    </div>
  );
}
