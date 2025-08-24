import Link from "next/link";
import { UserPlus } from "lucide-react";
import { signUpAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage, Message } from "@/components/form-message";
import { SmtpMessage } from "../smtp-message";

export default async function SignUpPage(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              创建账户
            </h1>
            <p className="text-white/70">
              开始您的Todo之旅
            </p>
          </div>

          <form action={signUpAction} className="space-y-6">
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
                placeholder="请输入密码（至少6位）"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                required
                minLength={6}
              />
            </div>

            <SubmitButton 
              pendingText="注册中..."
              className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              注册
            </SubmitButton>
            
            <FormMessage message={searchParams} />
          </form>

          <div className="mb-6">
            <SmtpMessage />
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/70">
              已经有账户了？{" "}
              <Link
                href="/sign-in"
                className="text-white hover:text-white/80 font-medium transition-colors duration-200"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}