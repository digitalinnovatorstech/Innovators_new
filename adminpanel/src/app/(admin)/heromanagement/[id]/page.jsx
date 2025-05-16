"use client";

import React, { useEffect } from "react";
import { Anchor, Breadcrumbs, TextInput, Loader } from "@mantine/core";
import SaveIcon from "../../../../../public/assets/saveicon.svg";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { useHeroById, useUpdateHero } from "../hooks/heroCRUDapis";

export default function EditHeroPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
    },
    mode: "onSubmit",
  });

  const { data: heroData, isLoading, error } = useHeroById(id);

  useEffect(() => {
    if (heroData) {
      console.log("Setting form data:", heroData);
      reset({
        title: heroData.title || "",
        subtitle: heroData.subtitle || "",
      });
    }
  }, [ heroData, reset ]);

  const { mutate: updateHero } = useUpdateHero();

  const onSubmit = (data) => {
    const publishData = { ...data, status: "publish" };

    updateHero(
      {
        id: id,
        data: publishData,
      },
      {
        onSuccess: (response) => {
          console.log("Update successful:", response);
          router.push("/heromanagement");
        },
        onError: (error) => {
          console.error("API error:", error);
        },
      }
    );
  };

  const saveAsDraft = () => {
    handleSubmit((data) => {
      const draftData = { ...data, status: "draft" };

      updateHero(
        {
          id: id,
          data: draftData,
        },
        {
          onSuccess: (response) => {
            console.log("Draft saved successfully:", response);
            router.push("/heromanagement");
          },
          onError: (error) => {
            console.error("Error saving draft:", error);
          },
        }
      );
    })();
  };

  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Hero Management", href: "/heromanagement" },
    { title: "Edit Hero", href: `/heromanagement/edit/${id}` },
  ].map((item, index) => (
    <Anchor
      href={item.href}
      key={index}
      className="text-[#206BC4] hover:underline"
    >
      {item.title}
    </Anchor>
  ));

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader size="lg" />
        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500"> loading... {error.message}</div>;
  }

  if (!heroData && !isLoading) {
    return <div className="p-6 text-yellow-500">No data found {id}</div>;
  }

  return (
    <>
      <div className="">
        <div className="my-5">
          <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
        </div>
        <div className="flex justify-between gap-5 w-full">
          {/* Form Container - 60% width */}
          <div className="w-4/5 p-6 bg-white border border-[#E5E8EC] rounded-md">
            <h1 className="text-2xl font-semibold mb-6">Edit Hero</h1>

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
                Update and Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
