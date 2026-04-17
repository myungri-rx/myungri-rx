
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ className, label, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-text-secondary font-display">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-colors",
          className,
        )}
        {...props}
      />
    </div>
  );
}
