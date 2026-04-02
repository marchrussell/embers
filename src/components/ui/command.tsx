import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import * as React from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function Command({ className, ref, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/95 text-white backdrop-blur-2xl",
        className
      )}
      {...props}
    />
  );
}
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden border border-white/10 bg-black/95 p-0 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-light [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-white/60 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-14 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

function CommandInput({ className, ref, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center border-b border-white/10 px-4" cmdk-input-wrapper="">
      <Search className="mr-3 h-5 w-5 shrink-0 text-white/40" />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "flex h-14 w-full rounded-md bg-transparent py-3 text-base text-white outline-none placeholder:font-light placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}

CommandInput.displayName = CommandPrimitive.Input.displayName;

function CommandList({ className, ref, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      ref={ref}
      className={cn("max-h-[400px] overflow-y-auto overflow-x-hidden p-2", className)}
      {...props}
    />
  );
}

CommandList.displayName = CommandPrimitive.List.displayName;

function CommandEmpty({ ref, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      className="py-8 text-center text-sm font-light text-white/60"
      {...props}
    />
  );
}

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

function CommandGroup({ className, ref, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        "overflow-hidden p-1 text-white [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-light [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-white/50",
        className
      )}
      {...props}
    />
  );
}

CommandGroup.displayName = CommandPrimitive.Group.displayName;

function CommandSeparator({ className, ref, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-2 h-px bg-white/10", className)}
      {...props}
    />
  );
}
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

function CommandItem({ className, ref, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm font-light text-white/80 outline-none transition-all hover:bg-white/5 data-[disabled=true]:pointer-events-none data-[selected='true']:bg-white/10 data-[selected='true']:text-white data-[disabled=true]:opacity-50 data-[selected='true']:backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs font-light tracking-widest text-white/40", className)}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
