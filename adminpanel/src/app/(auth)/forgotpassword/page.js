"use client";

import { useForm, Controller } from "react-hook-form";
import { TextInput, PasswordInput, Button, Checkbox } from "@mantine/core";

export default function SignInForm() {
    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",

        },
    });

    const onSubmit = (data) => {
        console.log("Sign In Data:", data);
    };

    return (
        <div className="w-[400px] bg-white shadow-lg rounded-lg p-10 space-y-5 ">

            <h1 className="text-2xl font-bold text-start text-primary">
                Forgot Password
            </h1>
            <p className="text-xs text-start text-gray-500 text-[#4B5563] mr-2">
                Enter your email and we will send you a reset link
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
                            placeholder="Email Address"
                            label="Enter your email address"
                            error={errors.email?.message}
                            withAsterisk
                            autoComplete="off"
                        />
                    )}
                />



                {/* Sign In Button */}
                <Button type="submit" fullWidth color="blue" className="font-normal">
                    Send me the Link
                </Button>

            </form>
        </div>
    );
}
