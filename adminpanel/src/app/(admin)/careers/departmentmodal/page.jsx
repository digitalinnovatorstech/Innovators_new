"use client";

import { Button, Modal, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { useCreateCategory } from "../../blogs/hooks/blogCRUDapis";

export default function DepartmentModal({
  departmentModalOpen,
  setDepartmentModalOpen,
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields },
  } = useForm({
    defaultValues: {
      deparmentname: "",
    },
  });

  const { mutate: createBlog } = useCreateCategory();

  const onSubmit = (data) => {
    const payload = {
      data: { name: data.deparmentname },
      type: "department",
    };

    createBlog(payload, {
      onSuccess: (response) => {
        reset();
        setDepartmentModalOpen(false);
      },
      onError: (error) => {
        console.error("Error creating department:", error);
      },
    });
  };

  return (
    <Modal
      opened={departmentModalOpen}
      onClose={() => setDepartmentModalOpen(false)}
      title="Add New Department"
      centered
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="deparmentname"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextInput
              {...field}
              placeholder="Department Name"
              className="w-full"
            />
          )}
        />
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={!dirtyFields?.deparmentname}
        >
          Save
        </Button>
      </form>
    </Modal>
  );
}
