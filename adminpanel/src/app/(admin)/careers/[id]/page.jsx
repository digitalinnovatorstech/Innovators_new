"use client";

import React, { useEffect, useState } from "react";
import {
  Anchor,
  Breadcrumbs,
  TextInput,
  Textarea,
  Select,
  Loader,
} from "@mantine/core";
import SaveIcon from "../../../../../public/assets/saveicon.svg";
import DeleteIcon from "../../../../../public/assets/deleteicon.svg";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { useGetCareerById, useUpdateCareer } from "../hooks/useCRUDapis";
import {
  useGetCategories,
  useDeleteCategory,
} from "../../blogs/hooks/blogCRUDapis";
import DepartmentModal from "../departmentmodal/page";
import dynamic from "next/dynamic";

// Import CKEditor dynamically to avoid SSR issues
const CkEditor = dynamic(() => import('@/components/tiptap'), {
  ssr: false,
});

export default function EditCareerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [ departmentModalOpen, setDepartmentModalOpen ] = useState(false);
  const [ editorContent, setEditorContent ] = useState("");
  const [ isEditorReady, setIsEditorReady ] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
 
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      role: "",
      department: "",
      roleDescription: "",
      experience: "",
      jobType: null,
      locations: null,
      content: "",
    },
    mode: "onSubmit",
  });

  // Fetch career data by ID
  const { data: careerData, isLoading, error } = useGetCareerById(id);

  // Fetch departments for dropdown
  const {
    data: departmentsData = { rows: [] },
    isLoading: isDepartmentsLoading,
  } = useGetCategories("department");

  // Create department options for select
  const departmentOptions =
    departmentsData.rows?.map((department) => ({
      value: department.id.toString(),
      label: department.name,
    })) || [];

  // Update mutation
  const { mutate: updateCareer } = useUpdateCareer();


  const deleteCategoryMutation = useDeleteCategory();

  // Process content from the API response

  useEffect(() => {
   
    if (careerData && !isEditorReady) {
      setValue("role", careerData?.role || "");

      // Find the department ID that matches the department name from careerData
      if (careerData?.department && departmentsData?.rows?.length > 0) {
        const departmentObj = departmentsData.rows.find(
          (dept) => dept.name === careerData.department
        );
        setValue("department", departmentObj ? departmentObj.id.toString() : "");
      }

      setValue("roleDescription", careerData?.roleDescription || "");
      setValue("experience", careerData?.experience || "");
      setValue("jobType", careerData?.jobType || null);
      setValue("locations", careerData?.locations || null);

      // Process content - replace image placeholders with actual URLs
      let processedContent = "";

      if (Array.isArray(careerData.content)) {
        careerData.content.forEach(item => {
          if (item.type === "html" && item.text) {
            let htmlContent = item.text;

            // If there's a URL and a placeholder in the text, replace the placeholder with the actual URL
            if (item.url) {
              // Extract the placeholder pattern (e.g., {{IMAGE_PLACEHOLDER_1}})
              const placeholderRegex = /{{IMAGE_PLACEHOLDER_(\d+)}}/g;

              // Replace the placeholder with the actual URL
              htmlContent = htmlContent.replace(placeholderRegex, item.url);
            }

            processedContent += htmlContent;
          }
        });
      }

      setValue("content", processedContent);
      setEditorContent(processedContent);
      setIsEditorReady(true);
    }
  }, [ careerData, departmentsData, setValue, isEditorReady ]);



  // Handle editor content updates
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

    // Also preserve existing image URLs
    const urlImgRegex = /<img[^>]+src="(https?:\/\/[^"]+)"[^>]*>/g;
    while ((match = urlImgRegex.exec(htmlContent)) !== null) {
      const fullImgTag = match[ 0 ];
      const imageUrl = match[ 1 ];

      // We'll keep these URLs intact, just noting them here
      console.log("Preserved image URL:", imageUrl);
    }

    return { cleanedContent, images };
  };

  // Handle form submission for publishing
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

    // Add any new images
    images.forEach((item) => {
      formData.append("content", item.file);
    });

    // Set status as published
    formData.append("status", "published");

    updateCareer(
      {
        id: id,
        data: formData,
      },
      {
        onSuccess: (response) => {
          console.log("Update successful:", response);
          router.push("/careers");
        },
        onError: (error) => {
          console.error("API error:", error);
        },
      }
    );
  };

  // Handle saving as draft
  const saveAsDraft = () => {
    handleSubmit((data) => {
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

      // Add any new images
      images.forEach((item) => {
        formData.append("content", item.file);
      });

      // Set status as draft
      formData.append("status", "draft");

      updateCareer(
        {
          id: id,
          data: formData,
        },
        {
          onSuccess: (response) => {
            console.log("Draft saved successfully:", response);
            router.push("/careers");
          },
          onError: (error) => {
            console.error("Error saving draft:", error);
          },
        }
      );
    })();
  };

  // Delete department handler
  const deleteDepartment = (id) => {
    deleteCategoryMutation.mutate({ id, type: "department" });
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Careers", href: "/careers" },
    { title: "Edit Career", href: `/careers/edit/${id}` },
  ].map((item, index) => (
    <Anchor
      href={item.href}
      key={index}
      className="text-[#206BC4] hover:underline"
    >
      {item.title}
    </Anchor>
  ));

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader size="lg" />
        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return <div className="p-6 text-red-500">Loading error: {error.message}</div>;
  }

  // No data state
  if (!careerData && !isLoading) {
    return (
      <div className="p-6 text-yellow-500">No data found for ID: {id}</div>
    );
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
            <h1 className="text-2xl font-semibold mb-6">Edit Career</h1>

            <form
              id="careerForm"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <Controller
                name="role"
                rules={{ required: "Role is required" }}
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Role"
                    {...field}
                    placeholder="Job Role"
                    required
                    error={errors?.role?.message}
                  />
                )}
              />

              <div className="flex justify-between gap-5 items-end">
                <div className="w-[70%]">
                  <Controller
                    name="department"
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
                                deleteDepartment(option.value);
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
                rules={{ required: "Description is required" }}
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
                  rules={{ required: "Experience is required" }}
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
                  rules={{ required: "Job Type is required" }}
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
                  rules={{ required: "Location is required" }}
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
                  {errors?.content?.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Right Sidebar */}
          <div className="w-2/5 p-6 bg-white border border-[#E5E8EC] rounded-md">
            <h1 className="text-2xl font-semibold mb-6">Publish</h1>
            <hr className="mb-5 text-[#CECECE]" />
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={saveAsDraft}
                className="flex items-center gap-2 text-xs p-2 bg-[#206BC4] text-white rounded-md"
              >
                <Image src={SaveIcon} alt="icon" className="w-5 h-5" /> Save as
                Draft
              </button>

              <button
                type="submit"
                form="careerForm"
                className="flex items-center gap-2 p-2  bg-[#2FB344] text-white rounded-md"
              >
                Update and Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      <DepartmentModal
        departmentModalOpen={departmentModalOpen}
        setDepartmentModalOpen={setDepartmentModalOpen}
      />
    </>
  );
}