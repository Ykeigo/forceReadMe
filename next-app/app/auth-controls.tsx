import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function AuthControls() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
      >
        ログイン
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.user.image ? (
        <Image
          src={session.user.image}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 rounded-full"
          referrerPolicy="no-referrer"
        />
      ) : null}
      <span className="max-w-[10rem] truncate text-sm text-zinc-700 dark:text-zinc-300">
        {session.user.name ?? session.user.email}
      </span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          ログアウト
        </button>
      </form>
    </div>
  );
}
