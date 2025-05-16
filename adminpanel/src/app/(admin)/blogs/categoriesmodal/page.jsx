"use client";

import { Button, Modal, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { useCreateCategory } from "../hooks/blogCRUDapis";

export default function CategoryModal({
  categoryModalOpen,
  setCategoryModalOpen,
  categoryType = "category", 
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields },
  } = useForm({
    defaultValues: {
      categoryname: "",
    },
  });

  const { mutate: createBlog } = useCreateCategory();

  const onSubmit = (data) => {
    createBlog(
      {
        data: { name: data.categoryname },
        type: categoryType,
      },
      {
        onSuccess: (response) => {
          reset();
          setCategoryModalOpen(false);
        },
        onError: (error) => {
          console.error(`Error creating ${categoryType}:`, error);
        },
      }
    );
  };

  const modalTitle = `Add New ${
    categoryType.charAt(0).toUpperCase() + categoryType.slice(1)
  }`;

  return (
    <Modal
      opened={categoryModalOpen}
      onClose={() => setCategoryModalOpen(false)}
      title={modalTitle}
      centered
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="categoryname"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextInput
              {...field}
              placeholder={`${
                categoryType.charAt(0).toUpperCase() + categoryType.slice(1)
              } Name`}
              className="w-full"
            />
          )}
        />
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={!dirtyFields?.categoryname}
        >
          Save
        </Button>
      </form>
    </Modal>
  );
}
