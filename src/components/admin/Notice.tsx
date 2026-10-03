import { Icon } from "./Icon";

export function Notice({ children, tone = "success" }: { children: React.ReactNode; tone?: "success" | "error" }) {
  const success = tone === "success";
  return (
    <p
      role={success ? "status" : "alert"}
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 font-semibold ${
        success ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <Icon name={success ? "checkCircle" : "alert"} className="mt-0.5 h-5 w-5" />
      <span>{children}</span>
    </p>
  );
}
