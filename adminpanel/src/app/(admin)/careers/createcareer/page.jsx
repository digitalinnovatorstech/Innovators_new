"use client";

import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import SaveIcon from "../../../../../public/assets/saveicon.svg";
import DeleteIcon from "../../../../../public/assets/deleteicon.svg";
import {
  TextInput,
  Textarea,
  Select,
  Text,
  Breadcrumbs,
  Anchor,
  FileInput,
} from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCreateCareer } from "../hooks/useCRUDapis";
import DepartmentModal from "../departmentmodal/page";
import {
  useDeleteCategory,
  useGetCategories,
} from "../../blogs/hooks/blogCRUDapis";
import dynamic from "next/dynamic";

// Import CKEditor dynamically to avoid SSR issues
const CkEditor = dynamic(() => import('@/components/tiptap'), {
  ssr: false,
});

export default function CreateCareer() {
  const router = useRouter();
  const [ preview, setPreview ] = useState(null);
  const [ departmentModalOpen, setDepartmentModalOpen ] = useState(false);
  const [ editorContent, setEditorContent ] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      role: "",
      // department: "",
      roleDescription: "",
      experience: "",
      jobType: null,
      locations: null,
      content: "",
      image: null,
    },
  });



  const {
    data: departmentsData = { rows: [] },
    isLoading: isDepartmentsLoading,
  } = useGetCategories("department");

  // Access the rows array from the response
  const departments = departmentsData.rows || [];

  // Create options for the Select component
  const departmentOptions = departments.map((department) => ({
    value: department.id.toString(),
    label: department.name,
  }));

  const { mutate: createBlog } = useCreateCareer();

  // Handler for CKEditor updates
  const handleEditorUpdate = (editorData) => {
    setEditorContent(editorData);
    setValue("content", editorData);
  };

  // Helper function to extract base64 images from HTML content
  const extractImagesFromContent = (htmlContent) => {
    const imgRegex = /<img[^>]+src="data:image\/[^>]+base64,([^"]+)"[^>]*>/g;
    const images = [];
    let cleanedContent = htmlContent;
    let match;

    // Extract all base64 images
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const fullImgTag = match[ 0 ];
      const base64Data = match[ 1 ];

      try {
        // Convert base64 to blob
        const byteString = atob(base64Data);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
          ia[ i ] = byteString.charCodeAt(i);
        }

        let imageType = "image/jpeg";
        if (fullImgTag.includes("data:image/png")) {
          imageType = "image/png";
        } else if (fullImgTag.includes("data:image/gif")) {
          imageType = "image/gif";
        }

        const blob = new Blob([ ab ], { type: imageType });
        const fileName = `inline-image-${images.length + 1}.${imageType.split("/")[ 1 ]}`;
        const file = new File([ blob ], fileName, { type: imageType });

        const imagePlaceholder = `{{IMAGE_PLACEHOLDER_${images.length + 1}}}`;
        images.push({ file, placeholder: imagePlaceholder });

        cleanedContent = cleanedContent.replace(
          fullImgTag,
          `<img src="${imagePlaceholder}" alt="Embedded Image ${images.length}" />`
        );
      } catch (error) {
        console.error("Error converting base64 to file:", error);
      }
    }

    return { cleanedContent, images };
  };

  const onSubmit = (data) => {
    const formData = new FormData();

    // Extract images from rich text content
    const { cleanedContent, images } = extractImagesFromContent(data.content);

    formData.append("role", data.role);
    formData.append("department", data.department);
    formData.append("roleDescription", data.roleDescription);
    formData.append("experience", data.experience);
    formData.append("jobType", data.jobType);
    formData.append("locations", data.locations);
    formData.append("paragraphs", cleanedContent);

    if (data.image) {
      formData.append("content", data.image);
    }

    images.forEach((item) => {
      formData.append("content", item.file);
    });

    // Add status as published
    formData.append("status", "published");

    createBlog(formData, {
      onSuccess: (response) => {
        router.push("/careers");
      },
      onError: (error) => {
        console.error("API error:", error);
      },
    });
  };

  const handleSaveAsDraft = () => {
    handleSubmit((data) => {
      const formData = new FormData();

      const { cleanedContent, images } = extractImagesFromContent(data.content);

      formData.append("role", data.role);
      formData.append("department", data.department);
      formData.append("roleDescription", data.roleDescription);
      formData.append("experience", data.experience);
      formData.append("jobType", data.jobType);
      formData.append("locations", data.locations);
      formData.append("paragraphs", cleanedContent);

      if (data.image) {
        formData.append("content", data.image);
      }

      images.forEach((item) => {
        formData.append("content", item.file);
      });

      // Set status as draft
      formData.append("status", "draft");

      // Send to API
      createBlog(formData, {
        onSuccess: (response) => {
          console.log("Career saved as draft:", response);
          router.push("/careers");
        },
        onError: (error) => {
          console.error("API error:", error);
        },
      });
    })();
  };

  const deleteCategoryMutation = useDeleteCategory();

  const deleteDepartment = (id) => {
    deleteCategoryMutation.mutate({ id, type: "department" });
  };

  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Careers", href: "/careers" },
    { title: "Create New Page", href: "/careers/createcareer" },
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
      <div className="my-5">
        <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-5">
          <div className="w-4/5 p-6 space-y-6 bg-white border border-[#E5E8EC] rounded-md">
            {/* Form fields remain the same */}
            <Controller
              name="role"
              rules={{ required: "Required" }}
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Role"
                  {...field}
                  placeholder="Name"
                  required
                  error={errors?.role?.message}
                />
              )}
            />

            <div className="flex justify-between gap-5 items-end">
              <div className="w-[70%]">
                <Controller
                  name="department"
                  rules={{ required: "Required" }}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      data={departmentOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Department"
                      clearable
                      label="Department"
                      searchable
                      renderOption={({ option }) => (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <span>{option.label}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDepartment(option.value); // Call the delete function
                              field.onChange(null);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              color: "red",
                            }}
                          >
                            <Image
                              src={DeleteIcon}
                              alt="icon"
                              className="w-5 h-5"
                            />
                          </button>
                        </div>
                      )}
                    />
                  )}
                />
              </div>

              <button
                type="button"
                onClick={() => setDepartmentModalOpen(true)}
                className="w-[20%] flex items-center justify-center gap-2 px-4 py-2 border border-[#DCE1E7] text-black rounded-md h-[36px]"
              >
                Add
              </button>
            </div>

            <Controller
              name="roleDescription"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Textarea
                  label="Role Description"
                  minRows={3}
                  {...field}
                  required
                  placeholder="Short description"
                  error={errors?.roleDescription?.message}
                />
              )}
            />

            <div className="flex justify-between gap-4">
              <Controller
                name="experience"
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <TextInput
                    label="Experience"
                    {...field}
                    required
                    placeholder="Enter Experience"
                    error={errors?.experience?.message}
                    className="flex-1"
                  />
                )}
              />

              <Controller
                name="jobType"
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <Select
                    label="Job Type"
                    {...field}
                    required
                    placeholder="Select Type"
                    data={[ "Full-time", "Part-time", "Contract", "Freelance" ]}
                    error={errors?.jobType?.message}
                    className="flex-1"
                  />
                )}
              />

              <Controller
                name="locations"
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <Select
                    label="Locations"
                    {...field}
                    required
                    placeholder="Select Value"
                    data={[ "Remote", "Onsite", "Hybrid" ]}
                    error={errors?.locations?.message}
                    className="flex-1"
                  />
                )}
              />
            </div>

            <div>
              <p className="text-sm text-primary font-medium mb-2">Content</p>
              <div className="border border-[#E5E8EC] rounded-md">
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: "Content is required" }}
                  render={({ field }) => (
                    <CkEditor
                      editorData={field.value}
                      setEditorData={field.onChange}
                      handleOnUpdate={(data) => handleEditorUpdate(data)}
                    />
                  )}
                />
              </div>
              {errors?.content?.message && (
                <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-2/5 space-y-6">
            {/* Buttons Container - 40% width */}
            <div className="p-4 bg-white border border-[#E5E8EC] rounded-md">
              <h1 className="text-2xl font-semibold mb-2">Publish</h1>
              <hr className="mb-5 text-[#CECECE]" />
              <div className="flex space-x-4">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 bg-[#206BC4] text-white rounded-md"
                  onClick={handleSaveAsDraft}
                >
                  <Image src={SaveIcon} alt="icon" className="w-5 h-5" /> Save
                  as Draft
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 bg-[#2FB344] text-white rounded-md"
                  onClick={handleSubmit(onSubmit)}
                >
                  Save and Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      <DepartmentModal
        departmentModalOpen={departmentModalOpen}
        setDepartmentModalOpen={setDepartmentModalOpen}
      />
    </>
  );
}