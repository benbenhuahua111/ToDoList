import { LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/actions";
import TodoApp from "@/components/todo-app";
import AuthButtons from "@/components/auth-buttons";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Todo List
            </h1>
            
            {user ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-white/80 text-sm">
                  欢迎回来，{user.email}
                </p>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </form>
              </div>
            ) : (
              <AuthButtons />
            )}
          </div>

          <TodoApp />
        </div>
      </div>
    </div>
  );
}