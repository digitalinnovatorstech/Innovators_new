"use client";

import { useForm, Controller } from "react-hook-form";
import { TextInput, PasswordInput, Button, Checkbox } from "@mantine/core";
import InnovatorsLogo from "../../../../public/assets/innovators.svg";
import FacebookIcon from "../../../../public/assets/facebook.svg";
import GoogleIcon from "../../../../public/assets/google.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useState } from "react";

import { addTokens, addUser } from "@/store/slices/auth";
import { showToast } from "@/services/toastMessages";
import instance from "@/services/axiosInstance";

export default function SignInForm() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [ loginError, setLoginError ] = useState("");
    const [ isLoading, setIsLoading ] = useState(false);
    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setLoginError("");

        try {
            const response = await instance.post("/users/login", {
                email: data.email,
                password: data.password,
            });
         

            if (response.data?.token) {
                localStorage.setItem("accessToken", response.data.token);

                dispatch(addTokens({ accessToken: response.data.token }));

                const userData = response.data.user || { email: data.email };
                dispatch(addUser(userData));

                router.push("/heromanagement");
                showToast("Login successful!", "success");
            } else {
                const errorMessage = "Invalid response from server";
                setLoginError(errorMessage);
                showToast(errorMessage, "error");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Invalid email or password";

            setLoginError(errorMessage);
            showToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-[350px]  space-y-6 ">
            <Image src={InnovatorsLogo} alt="Logo" width={200} height={200} />
            <h1 className="text-2xl font-bold text-start text-primary">
                Sign In to your Account
            </h1>
            <p className="text-sm text-start text-gray-500 text-[#4B5563] mr-2">
                Welcome back! Please enter your details
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Input */}
                <Controller
                    name="email"
                    control={control}
                    rules={{
                        required: "Email is required",
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                        },
                    }}
                    render={({ field }) => (
                        <TextInput
                            {...field}
                            placeholder="Email"
                            label="Email"
                            error={errors.email?.message}
                            withAsterisk
                            autoComplete="off"
                        />
                    )}
                />

                {/* Password Input */}
                <Controller
                    name="password"
                    control={control}
                    rules={{
                        required: "Password is required",
                        minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                        },
                    }}
                    render={({ field }) => (
                        <PasswordInput
                            {...field}
                            placeholder="Password"
                            label="Password"
                            error={errors.password?.message}
                            withAsterisk
                        />
                    )}
                />

                {/* Remember Me & Forgot Password (Disabled) */}
                <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                    <Checkbox label="Remember me" disabled checked={false} />
                    <span className="text-sm text-blue-500">Forgot Password?</span>
                </div>

                {/* Sign In Button */}
                <Button
                    type="submit"
                    fullWidth
                    color="blue"
                    className="font-normal"
                    loading={isLoading}
                >
                    Sign In
                </Button>

                {/* Divider */}
                <div className="flex items-center justify-center gap-2">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                        Or sign in with
                    </span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <div className="flex justify-between gap-4">
                    <button className="w-full flex items-center  bg-white justify-center gap-2 border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition cursor-not-allowed">
                        <Image src={GoogleIcon} alt="Google" width={20} height={20} />
                        Google
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition cursor-not-allowed">
                        <Image src={FacebookIcon} alt="Facebook" width={20} height={20} />
                        Facebook
                    </button>
                </div>

                {/* Sign Up Link */}
                <p className="text-sm text-center text-gray-500">
                    Don't have an account?{" "}
                    <a href="/signup" className="text-blue-500 hover:underline">
                        Sign Up
                    </a>
                </p>
            </form>
        </div>
    );
}
