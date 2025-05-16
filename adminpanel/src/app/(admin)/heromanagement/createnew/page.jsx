"use client";
import React from "react";
import { Anchor, Breadcrumbs, TextInput, Button } from "@mantine/core";
import SaveIcon from "../../../../../public/assets/saveicon.svg";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCreateHero } from "../hooks/heroCRUDapis";

export default function CreateHeroPage() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset, // Add reset function from useForm
  } = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
    },
    mode: "onSubmit",
  });

  // Get the mutation function from the hook
  const { mutate: createHero } = useCreateHero();

  const onSubmit = (data) => {
    const publishData = { ...data, status: "publish" };
    createHero(publishData, {
      onSuccess: (response) => {
        router.push("/heromanagement");
      },
      onError: (error) => {
        console.error("API error:", error);
      },
    });
  };

  const saveAsDraft = () => {
    handleSubmit((data) => {
      const draftData = { ...data, status: "draft" };
      createHero(draftData, {
        onSuccess: (response) => {
          router.push("/heromanagement");
        },
        onError: (error) => {
          console.error("Error saving draft:", error);
        },
      });
    })();
  };

  // Add a function to clear the form
  const handleClearForm = () => {
    reset({
      title: "",
      subtitle: "",
    });
  };

  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Hero Management", href: "/heromanagement" },
    { title: "Create New", href: "/heromanagement/createnew" },
  ].map((item, index) => (
    <Anchor
      href={item.href}
      key={index}
      className="text-[#206BC4] hover:underline"
    >
      {item.title}
    </Anchor>
  ));

  return (
    <>
      <div className="">
        <div className="my-5">
          <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
        </div>
        <div className="flex justify-between gap-5 w-full">
          {/* Form Container - 60% width */}
          <div className="w-4/5 p-6 bg-white border border-[#E5E8EC] rounded-md">
            <h1 className="text-2xl font-semibold mb-6">Create New Hero</h1>
            <form
              id="heroForm"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label="Title"
                      required
                      placeholder="Enter hero title"
                      error={errors.title?.message}
                    />
                  )}
                />
              </div>
              <div>
                <Controller
                  name="subtitle"
                  control={control}
                  rules={{ required: "Subtitle is required" }}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label="Subtitle"
                      required
                      placeholder="Enter hero subtitle"
                      error={errors.subtitle?.message}
                    />
                  )}
                />
              </div>
            </form>
          </div>
          {/* Buttons Container - 40% width */}
          <div className="w-2/5 p-6 bg-white border border-[#E5E8EC] rounded-md">
            <h1 className="text-2xl font-semibold mb-6">Publish</h1>
            <hr className="mb-5 text-[#CECECE]" />
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={saveAsDraft}
                className="flex items-center gap-2 px-4 py-2 bg-[#206BC4] text-white rounded-md"
              >
                <Image src={SaveIcon} alt="icon" className="w-5 h-5" /> Save as
                Draft
              </button>
              <button
                type="submit"
                form="heroForm"
                className="flex items-center gap-2 px-4 py-2 bg-[#2FB344] text-white rounded-md"
              >
                Save and Publish
              </button>

            </div>
            <button
              type="button"
              onClick={handleClearForm}
              className="flex items-center mt-10 gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
