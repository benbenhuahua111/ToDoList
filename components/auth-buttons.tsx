import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthButtons() {
  return (
    <div className="flex gap-3 justify-center">
      <Link
        href="/sign-in"
        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        登录
      </Link>
      <Link
        href="/sign-up"
        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
      >
        <UserPlus className="w-4 h-4" />
        注册
      </Link>
    </div>
  );
}
