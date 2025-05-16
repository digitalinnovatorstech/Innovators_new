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
import instance from "@/services/axiosInstance";

export default function SignUpForm() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [signupError, setSignupError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        defaultValues: {
            username: "",
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setSignupError("");

        try {

            const response = await instance.post("users/signup", {
                name: data.username,
                email: data.email,
                password: data.password,
            });



            if (response.data?.accessToken) {

                dispatch(addTokens({ accessToken: response.data.accessToken }));


                const userData = response.data.user || {
                    name: data.username,
                    email: data.email
                };
                dispatch(addUser(userData));


                router.push("/heromanagement");

            }
        } catch (error) {

            setSignupError(error.response?.data?.message || "Error creating account");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-[350px] space-y-4">
            <Image src={InnovatorsLogo} alt="Logo" width={200} height={200} />
            <h1 className="text-2xl font-bold text-start text-primary">
                Sign Up for an Account
            </h1>

            {signupError && (
                <div className="text-red-500 text-sm">{signupError}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Username Input */}
                <Controller
                    name="username"
                    control={control}
                    rules={{
                        required: "Username is required",
                    }}
                    render={({ field }) => (
                        <TextInput
                            {...field}
                            placeholder="Username"
                            label="Username"
                            error={errors?.username?.message}
                            withAsterisk
                            autoComplete="off"
                        />
                    )}
                />

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
                            value: 8,
                            message: "Password must be at least 8 characters",
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
                <p className="text-xs text-start text-gray-500 text-[#4B5563] mr-2">
                    Your password must have at least 8 characters
                </p>

                <div className="flex items-center justify-between">
                    <Controller
                        name="rememberMe"
                        control={control}
                        rules={{
                            required: "You must agree to the terms and conditions"
                        }}
                        render={({ field: { value, onChange, ...rest } }) => (
                            <Checkbox
                                checked={value}
                                disabled
                                onChange={(event) => onChange(event.currentTarget.checked)}
                                label={
                                    <span className="text-gray-700 text-xs">
                                        By creating an account means you agree to the
                                        <a href="/terms" className="text-blue-500 hover:underline mx-1">
                                            Terms & Conditions
                                        </a>
                                        and our
                                        <a href="/privacy" className="text-blue-500 hover:underline mx-1">
                                            Privacy Policy
                                        </a>
                                    </span>
                                }
                                error={errors.rememberMe?.message}
                                {...rest}
                            />
                        )}
                    />
                </div>

                {/* Sign Up Button */}
                <Button
                    type="submit"
                    fullWidth
                    color="blue"
                    className="font-normal"
                    loading={isLoading}
                >
                    Sign Up
                </Button>

                {/* Divider */}
                <div className="flex items-center justify-center gap-2">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                        Or sign up with
                    </span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <div className="flex justify-between gap-4">
                    <button
                        type="button"
                        className="w-full flex items-center bg-white justify-center gap-2 border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition cursor-not-allowed"
                    >
                        <Image src={GoogleIcon} alt="Google" width={20} height={20} />
                        Google
                    </button>
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition cursor-not-allowed"
                    >
                        <Image src={FacebookIcon} alt="Facebook" width={20} height={20} />
                        Facebook
                    </button>
                </div>

                {/* Sign In Link */}
                <p className="text-sm text-center flex gap-1 justify-center text-gray-500">
                    Already have an account?
                    <a href="/signin" className="text-blue-500 hover:underline">
                        Sign In
                    </a>
                </p>
            </form>
        </div>
    );
}
