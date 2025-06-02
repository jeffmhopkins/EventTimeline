import { cn } from "@/lib/utils";

interface MenuToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  darkMode?: boolean;
}

export function MenuToggle({ checked, onCheckedChange, darkMode = false }: MenuToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        checked 
          ? "bg-blue-600" 
          : darkMode 
            ? "bg-slate-600" 
            : "bg-slate-300"
      )}
    >
      <span
        aria-hidden="true"
        style={{
          transform: checked ? 'translateX(16px)' : 'translateX(0px)',
          transition: 'transform 200ms ease-in-out'
        }}
        className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full shadow ring-0",
          checked 
            ? "bg-white" 
            : darkMode 
              ? "bg-slate-300" 
              : "bg-white"
        )}
      />
    </button>
  );
}