"use client";

export function DeleteButton({
  action,
  id,
  label,
  confirmMessage,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: number;
  label: string;
  confirmMessage: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!window.confirm(confirmMessage)) e.preventDefault();
        }}
        className="font-semibold text-red-700 underline-offset-4 hover:underline"
      >
        {label}
      </button>
    </form>
  );
}
