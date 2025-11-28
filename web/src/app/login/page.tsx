"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Modal from "../components/common/Modal";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const { login, redirectAfterAuth } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password);
      
      if (success) {
        setModal({
          isOpen: true,
          type: 'success',
          title: '로그인 성공!',
          message: '환영합니다! 서비스 페이지로 이동합니다.'
        });
      } else {
        setModal({
          isOpen: true,
          type: 'error',
          title: '로그인 실패',
          message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: '로그인 실패',
        message: '로그인 중 오류가 발생했습니다.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'kakao' | 'naver') => {
    if (typeof window === 'undefined') return
    
    // OAuth2 로그인 URL로 리다이렉트
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083/api';
    const backendUrl = apiBaseUrl.replace('/api', '');
    window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
  };

  const handleModalClose = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSuccessModalButton = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
    // AuthContext에서 자동으로 리다이렉션 처리됨
  };

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background with Blur */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/images/tug1.png")',
          filter: 'blur(8px)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Content with backdrop */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8">
          <div>
            <div className="flex justify-center">
              <div className="flex items-center">
                <Heart className="h-10 w-10 text-[#C59172]" />
                <span className="ml-2 text-3xl font-bold text-gray-900">PetMily</span>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              로그인
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              또는{" "}
              <Link
                href="/register"
                className="font-medium text-[#C59172] hover:text-[#B07A5C]"
              >
                새 계정 만들기
              </Link>
            </p>
          </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#C59172] focus:border-[#C59172] focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#C59172] focus:border-[#C59172] focus:z-10 sm:text-sm"
                placeholder="비밀번호"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#C59172] focus:ring-[#C59172] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                로그인 상태 유지
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-[#C59172] hover:text-[#B07A5C]"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#C59172] hover:bg-[#B07A5C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C59172] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-pink-50 to-blue-50 text-gray-500">
                  또는
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('kakao')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                </svg>
                <span className="ml-2">Kakao</span>
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
      
      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={handleModalClose}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        buttonText={modal.type === 'success' ? '홈으로 이동' : '확인'}
        onButtonClick={modal.type === 'success' ? handleSuccessModalButton : undefined}
        autoClose={modal.type === 'success'}
        autoCloseDelay={3000}
      />
    </div>
  );
}
