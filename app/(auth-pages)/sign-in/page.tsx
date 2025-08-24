import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { signInAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage, Message } from "@/components/form-message";

export default async function SignInPage(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              欢迎回来
            </h1>
            <p className="text-white/70">
              登录您的账户
            </p>
          </div>

          <form action={signInAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="请输入您的邮箱"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="请输入您的密码"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-white/70 hover:text-white text-sm transition-colors duration-200"
              >
                忘记密码？
              </Link>
            </div>

            <SubmitButton 
              pendingText="登录中..."
              className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              登录
            </SubmitButton>
            
            <FormMessage message={searchParams} />
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/70">
              还没有账户？{" "}
              <Link
                href="/sign-up"
                className="text-white hover:text-white/80 font-medium transition-colors duration-200"
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}