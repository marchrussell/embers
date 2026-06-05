import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

const OnlineTabLayout = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("pt-20", className)}>{children}</div>
);

export default OnlineTabLayout;
