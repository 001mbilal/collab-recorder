import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FieldValues } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";

import { authApi } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { loginSchema, registerSchema } from "../validators/auth";
import { LoginFormData, RegisterFormData } from "../types";

export const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    resolver: yupResolver(isLoginMode ? loginSchema : registerSchema) as any,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      authLogin(data.token, data.user);
      navigate("/dashboard");
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      authLogin(data.token, data.user);
      navigate("/dashboard");
    },
  });

  const onSubmit = (data: FieldValues): void => {
    if (isLoginMode) {
      loginMutation.mutate(data as LoginFormData);
    } else {
      registerMutation.mutate(data as RegisterFormData);
    }
  };

  const toggleMode = (): void => {
    setIsLoginMode(!isLoginMode);
    reset();
    loginMutation.reset();
    registerMutation.reset();
  };

  const currentMutation = isLoginMode ? loginMutation : registerMutation;
  const error = currentMutation.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WonderTech</h1>
          <p className="text-gray-600">
            {isLoginMode
              ? "Welcome back! Please login to continue."
              : "Create an account to get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLoginMode && (
            <div>
              <label htmlFor="name" className="label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...registerField("name")}
                className={errors.name ? "input-error" : "input"}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="error-text">{errors.name.message as string}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...registerField("email")}
              className={errors.email ? "input-error" : "input"}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="error-text">{errors.email.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...registerField("password")}
              className={errors.password ? "input-error" : "input"}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="error-text">{errors.password.message as string}</p>
            )}
          </div>

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
              {error instanceof Error ? error.message : "An error occurred"}
            </div>
          )}

          <button
            type="submit"
            disabled={currentMutation.isPending}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentMutation.isPending
              ? "Loading..."
              : isLoginMode
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {isLoginMode
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};
