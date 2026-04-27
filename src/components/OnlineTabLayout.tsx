import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

const OnlineTabLayout = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("pt-8 md:pt-[150px]", className)}>{children}</div>
);

export default OnlineTabLayout;
