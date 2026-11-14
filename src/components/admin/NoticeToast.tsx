"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/components/toast/ToastProvider";

// After a post or member is created, published or deleted, the server sends the person back with "?notice=…" in the
// address. This shows that notice as a toast, then removes it from the address so that refreshing the page does not
// show it again.
// It watches the address, so a page that stays open (like one person's page, where several decisions can follow each
// other) shows a toast for every notice, not only for the first one.
export function NoticeToast({ message }: { message: string }) {
  const toast = useToast();
  const notice = useSearchParams().get("notice");

  useEffect(() => {
    if (!notice) return;
    toast.success(message);
    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice, message, toast]);

  return null;
}
