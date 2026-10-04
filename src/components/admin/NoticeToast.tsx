"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/toast/ToastProvider";

// After a post or member is created, published or deleted, the server sends the person back to the list with
// "?notice=…" in the address. This shows that notice as a toast, then removes it from the address
// so that refreshing the page does not show it again.
export function NoticeToast({ message }: { message: string }) {
  const toast = useToast();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    toast.success(message);
    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [message, toast]);

  return null;
}
