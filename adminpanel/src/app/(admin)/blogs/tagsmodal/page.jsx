"use client";

import { Button, Modal, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { useCreateBlog, useCreateTags } from "../hooks/blogCRUDapis";

export default function CustomModal({ modalOpened, setModalOpened }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields },
  } = useForm({
    defaultValues: {
      tagname: "",
    },
  });

  const { mutate: createBlog } = useCreateTags();

  const onSubmit = (data) => {
    // Create the tag data to send to the API
    const tagData = {
      name: data.tagname,
      // Add any other required fields for tag creation
    };

    createBlog(tagData, {
      onSuccess: (response) => {
        console.log("Tag created successfully:", response);
        reset(); // Reset the form
        setModalOpened(false); // Close the modal
      },
      onError: (error) => {
        console.error("Error creating tag:", error);
      }
    });
  };

  return (
    <Modal
      opened={modalOpened}
      onClose={() => setModalOpened(false)}
      title="Add New Tag"
      centered
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="tagname"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextInput
              {...field}
              placeholder="Enter tag name"
              className="w-full"
            />
          )}
        />
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={!dirtyFields?.tagname}
        >
          Save
        </Button>
      </form>
    </Modal>
  );
}
