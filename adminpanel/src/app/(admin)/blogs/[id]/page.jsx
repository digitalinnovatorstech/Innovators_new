"use client";

import React, { useRef, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import SaveIcon from "../../../../../public/assets/saveicon.svg";
import DeleteIcon from "../../../../../public/assets/deleteicon.svg";
import {
    TextInput,
    Select,
    Text,
    Switch,
    Breadcrumbs,
    Anchor,
    MultiSelect,
    Loader,
} from "@mantine/core";
import Image from "next/image";
import CustomModal from "../tagsmodal/page";
import {
    useUpdateBlogs,
    useDeleteCategory,
    useDeleteTag,
    useGetCategories,
    useGetTags,
    useGetBlogById,
} from "../hooks/blogCRUDapis";
import { useRouter, useParams } from "next/navigation";
import CategoryModal from "../categoriesmodal/page";
import dynamic from "next/dynamic";

// Import CKEditor dynamically to avoid SSR issues
const CkEditor = dynamic(() => import("@/components/tiptap"), {
    ssr: false,
});

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [ modalOpen, setModalOpen ] = useState(false);
    const [ categoryModalOpen, setCategoryModalOpen ] = useState(false);
    const fileInputRef = useRef(null);
    const [ preview, setPreview ] = useState(null);
    const [ editorContent, setEditorContent ] = useState("");
    const [ isEditorReady, setIsEditorReady ] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            permalink: "",
            description: "",
            content: "",
            category: null,
            image: null,
            tags: [],
            comments: false,
        },
        mode: "onSubmit",
    });

    // Fetch blog data by ID
    const { data: blogData, isLoading, error } = useGetBlogById(id);
    console.log(blogData, "dara");

    // Fetch tags and categories
    const { data: tags = [] } = useGetTags();
    const { data: categoriesData = { rows: [] } } = useGetCategories("category");

    // Mutations
    const { mutate: updateBlog } = useUpdateBlogs();
    const { mutate: deleteTag } = useDeleteTag();
    const { mutate: deleteCategory } = useDeleteCategory();

    // Options for dropdowns
    const tagOptions = tags.map((tag) => ({
        value: tag.id.toString(),
        label: tag.name,
    }));

    const categories = categoriesData.rows || [];
    const categoryOptions = categories.map((category) => ({
        value: category.id.toString(),
        label: category.name,
    }));

    // Add this function to your component
    const processContentStructure = (contentStructure) => {
        if (!contentStructure || !Array.isArray(contentStructure)) {
            return "";
        }

        let htmlContent = "";

        contentStructure.forEach((item) => {
            if (item.type === "text") {
                // Wrap text in paragraph tags
                htmlContent += `<p>${item.value}</p>`;
            } else if (item.type === "image" && item.value) {
                // Create image tag with the URL
                htmlContent += `<figure class="image"><img src="${item.value}" alt="Blog image" /></figure>`;
            }
        });

        return htmlContent;
    };

    useEffect(() => {
        if (blogData && !isEditorReady) {
            setValue("name", blogData.data.title || "");
            setValue("permalink", blogData.data.permalink || "");
            setValue("description", blogData.data.description || "");

            if (blogData.data.category) {

                setValue("category", blogData.data.category.toString());
            } else if (blogData.data.categories && blogData.data.categories.id) {

                setValue("category", blogData.data.categories.id.toString());
            }


            setValue(
                "comments",
                blogData.data.comments === "1" || blogData.data.comments === true
            );

            // Handle tags
            if (blogData.data.tags && Array.isArray(blogData.data.tags)) {
                const tagIds = blogData.data.tags
                    .filter((tag) => tag && tag.id) // Filter out tags without an id
                    .map((tag) => tag.id.toString());
                setValue("tags", tagIds);
            }

            // Process content structure
            let processedContent = "";

            if (
                blogData.data.content_structure &&
                Array.isArray(blogData.data.content_structure)
            ) {
                processedContent = processContentStructure(blogData.data.content_structure);
            } else if (blogData.data.content) {
                processedContent = blogData.data.content;
            } else if (blogData.data.paragraphs) {
                processedContent = blogData.data.paragraphs;
            }

            // Set the processed content in the form and editor
            setValue("content", processedContent);
            setEditorContent(processedContent);

            // Handle featured image preview
            if (blogData.data.image) {
                setPreview(blogData.data.image);
            }

            setIsEditorReady(true);
        }
    }, [ blogData, setValue, isEditorReady ]);

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
                const fileName = `inline-image-${images.length + 1}.${imageType.split("/")[ 1 ]
                    }`;
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

    // Process content for submission
    const processContentForSubmission = (htmlContent) => {
        const { cleanedContent, images } = extractImagesFromContent(htmlContent);
        const contentArray = [];
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = cleanedContent;

        Array.from(tempDiv.childNodes).forEach((node) => {
            // Check if it's a paragraph
            if (node.nodeName === "P") {
                const img = node.querySelector("img");
                if (img) {
                    const src = img.getAttribute("src");
                    const placeholderMatch = src.match(/{{IMAGE_PLACEHOLDER_(\d+)}}/);
                    if (placeholderMatch) {
                        const index = parseInt(placeholderMatch[ 1 ]) - 1;
                        contentArray.push({
                            type: "image",
                            value: `image_${index + 1}`,
                        });
                    }
                }
                // Regular text paragraph
                else if (node.textContent.trim()) {
                    contentArray.push({
                        type: "text",
                        value: node.textContent.trim(),
                    });
                }
            } else if (node.nodeName === "FIGURE") {
                const img = node.querySelector("img");
                if (img) {
                    const src = img.getAttribute("src");
                    const placeholderMatch = src.match(/{{IMAGE_PLACEHOLDER_(\d+)}}/);
                    if (placeholderMatch) {
                        const index = parseInt(placeholderMatch[ 1 ]) - 1;
                        contentArray.push({
                            type: "image",
                            value: `image_${index + 1}`,
                        });
                    }
                }
            }
        });

        return { cleanedContent, contentArray, images };
    };

    // Prepare form data for submission
    const prepareFormData = (data, status) => {
        const formData = new FormData();
        const { cleanedContent, contentArray, images } =
            processContentForSubmission(data.content);

        formData.append("title", data.name);

        formData.append("category", data.category || "");
        formData.append("paragraphs", cleanedContent);
        formData.append("content_structure", JSON.stringify(contentArray));
        formData.append("comments", data.comments ? "1" : "0");
        formData.append("status", status);

        if (Array.isArray(data.tags) && data.tags.length > 0) {
            formData.append("tags", JSON.stringify(data.tags));
        }

        if (data.image && typeof data.image !== "string") {
            formData.append("image", data.image);
        }

        images.forEach((item, index) => {
            formData.append(`content_image_${index + 1}`, item.file);
        });

        return { formData, images };
    };

    // Handle form submission for publishing
    const onSubmit = (data) => {
        const { formData } = prepareFormData(data, "published");

        updateBlog(
            { id, data: formData },
            {
                onSuccess: () => {
                    router.push("/blogs");
                },
                onError: (error) => {
                    console.error("API error:", error);
                },
            }
        );
    };

    // Handle saving as draft
    const handleSaveAsDraft = () => {
        handleSubmit((data) => {
            const { formData } = prepareFormData(data, "draft");

            updateBlog(
                { id, data: formData },
                {
                    onSuccess: () => {
                        router.push("/blogs");
                    },
                    onError: (error) => {
                        console.error("Error saving draft:", error);
                    },
                }
            );
        })();
    };

    // Handle file selection for featured image
    const handleTextClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[ 0 ];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setValue("image", file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = () => {
        setPreview(null);
        fileInputRef.current.value = "";
        setValue("image", null);
    };

    // Delete category handler
    const handleDeleteCategory = (id) => {
        deleteCategory({ id, type: "category" });
    };

    // Breadcrumb items
    const breadcrumbItems = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Blogs", href: "/blogs" },
        { title: "Edit Blog", href: `/blogs/${id}` },
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
        return (
            <div className="p-6 text-red-500">Loading error: {error.message}</div>
        );
    }

    // No data state
    if (!blogData && !isLoading) {
        return (
            <div className="p-6 text-yellow-500">No data found for ID: {id}</div>
        );
    }

    return (
        <>
            <div className="my-5">
                <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex gap-5">
                    <div className="w-4/5 p-6 space-y-6 bg-white border border-[#E5E8EC] rounded-md">
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: "Name is required" }}
                            render={({ field }) => (
                                <TextInput
                                    {...field}
                                    label="Name"
                                    required
                                    error={errors?.name?.message}
                                    placeholder="Name"
                                />
                            )}
                        />

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
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.content.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-2/5 space-y-6">
                        {/* Buttons Container */}
                        <div className="p-4 bg-white border border-[#E5E8EC] rounded-md">
                            <h1 className="text-2xl font-semibold mb-2">Update</h1>
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
                                    Update and Publish
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-white border border-[#E5E8EC] rounded-md">
                            <div className="flex justify-between">
                                <Text fw={500} mb="md">
                                    Categories
                                </Text>
                                <button
                                    type="button"
                                    onClick={() => setCategoryModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 border border-[#DCE1E7] text-black rounded-md"
                                >
                                    Add
                                </button>
                            </div>
                            <hr className="my-5 text-[#CECECE]" />
                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        data={categoryOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select Category"
                                        clearable
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
                                                        handleDeleteCategory(option.value);
                                                        field.onChange(null); // Clear the selected value
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

                        <div className="p-4 bg-white border border-[#E5E8EC] rounded-md">
                            <Text fw={500} mb="md">
                                Image
                            </Text>
                            <hr className="mb-5 text-[#CECECE]" />
                            <div className="text-start">
                                {preview && (
                                    <div className="mt-4 relative inline-block">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover border rounded-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="absolute top-0 right-0 bg-blue-400 text-white rounded-full p-1 w-5 text-xs"
                                        >
                                            x
                                        </button>
                                    </div>
                                )}
                                <p
                                    className="cursor-pointer text-secondary hover:underline"
                                    onClick={handleTextClick}
                                >
                                    Choose Image
                                </p>
                                <p>
                                    or <span className="text-secondary">add from url</span>
                                </p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-white border border-[#E5E8EC] rounded-md">
                            <div className="flex justify-between">
                                <Text fw={500} mb="md">
                                    Tags
                                </Text>
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 border border-[#DCE1E7] text-black rounded-md"
                                >
                                    Add
                                </button>
                            </div>

                            <hr className="my-5 text-[#CECECE]" />
                            <Controller
                                name="tags"
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        placeholder="Select tags"
                                        data={tagOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        clearable
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
                                                        deleteTag(option.value);
                                                        field.onChange(
                                                            field.value.filter((id) => id !== option.value)
                                                        ); // Remove tag from selection
                                                    }}
                                                    style={{
                                                        background: "transparent",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        color: "red",
                                                    }}
                                                >
                                                    <Image src={DeleteIcon} alt="Delete" />
                                                </button>
                                            </div>
                                        )}
                                    />
                                )}
                            />
                        </div>

                        <div className="p-4 bg-white border border-[#E5E8EC] rounded-md">
                            <Text fw={500} mb="md">
                                Comments
                            </Text>
                            <hr className="mb-5 text-[#CECECE]" />
                            <Controller
                                name="comments"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <Switch
                                        label="Enable Comments"
                                        checked={value}
                                        onChange={(event) => onChange(event.currentTarget.checked)}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </form>
            <CategoryModal
                categoryModalOpen={categoryModalOpen}
                setCategoryModalOpen={setCategoryModalOpen}
                categoryType="category"
            />
            <CustomModal modalOpened={modalOpen} setModalOpened={setModalOpen} />
        </>
    );
}
