import { fontUnbounded } from "@/fonts";
import { cn } from "@/lib/utils";
import { AccountBalance } from "@/components/account/account-balance";

export default async function Home() {
  return (
    <main className="flex min-h-screen p-6 sm:p-8 pb-20 flex-col gap-[32px] row-start-2 items-center justify-center relative">
      <h1
        className={cn(
          "text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground/70 via-foreground to-foreground/70",
          fontUnbounded.className,
        )}
      >
        trace
      </h1>
      <p>a better way to authenticate</p>

      <AccountBalance />
    </main>
  );
}
