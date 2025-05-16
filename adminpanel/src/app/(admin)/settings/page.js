"use client";
import React, { useState, useEffect } from "react";
import {
  Anchor,
  Breadcrumbs,
  Text,
  TextInput,
  Button,
  Group,
  FileInput,
} from "@mantine/core";
import UploadIcon from "../../../../public/assets/uploadimageicon.svg";
import Image from "next/image";
import {
  useCreateSettings,
  useGetAllSettings,
  useUpdateSettings,
} from "./hooks/useCRUDapis";

export default function SettingsPage() {
  const [dashboardLogo, setDashboardLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [newSocialIcon, setNewSocialIcon] = useState(null);
  const [socialMediaItems, setSocialMediaItems] = useState([]);
  const [showSocialInput, setShowSocialInput] = useState(false);
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [editingSocialIndex, setEditingSocialIndex] = useState(null);

  // State for displaying existing images
  const [dashboardLogoUrl, setDashboardLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  // State for settings ID
  const [settingsId, setSettingsId] = useState(null);

  // Form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: updateSettings } = useUpdateSettings();
  const { data: getSettings, isLoading } = useGetAllSettings();

  // Load existing settings when data is available
  useEffect(() => {
    if (getSettings) {
      setSettingsId(getSettings.id);
      setDashboardLogoUrl(getSettings.dashboardLogo || "");
      setFaviconUrl(getSettings.favicon || "");

      if (getSettings.socialMedia && Array.isArray(getSettings.socialMedia)) {
        // Transform the data to match your state structure
        const transformedSocialMedia = getSettings.socialMedia.map((item) => ({
          url: item.socialMediaUrl,
          iconUrl: item.imageUrl,
          // We'll keep the icon file as null since we can't convert URL to File
          icon: null,
        }));
        setSocialMediaItems(transformedSocialMedia);
      }
    }
  }, [getSettings]);

  const breadcrumbItems = [{ title: "SETTINGS", href: "/settings" }].map(
    (item, index) => (
      <Anchor
        href={item.href}
        key={index}
        className="text-[#206BC4] hover:underline"
      >
        {item.title}
      </Anchor>
    )
  );

  // Import the createSettings mutation hook
  const { mutate: createSettings } = useCreateSettings();

  // In your handleSubmit function
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();

    if (dashboardLogo) {
      formData.append("dashboardLogo", dashboardLogo);
    }

    if (favicon) {
      formData.append("favicon", favicon);
    }

    // Create an array of social media URLs
    const socialMediaUrlsArray = socialMediaItems.map((item, index) => {
      // Include the original imageUrl if it exists and no new icon is provided
      return {
        socialMediaUrl: item.url,
      };
    });

    // Append the JSON string of social media URLs
    formData.append("socialMedia", JSON.stringify(socialMediaUrlsArray));

    // Append only the new icon files with their index
    socialMediaItems.forEach((item, index) => {
      if (item.icon) {
        formData.append(`socialMediaImage${index}`, item.icon);
      }
    });

    // Log the form data for debugging (optional)
    console.log("Form data entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    // If we have an existing settings ID, update instead of create
    if (settingsId) {
      updateSettings(
        { id: settingsId, formData },
        {
          onSuccess: () => {
            setIsSubmitting(false);
          },
          onError: () => {
            setIsSubmitting(false);
          },
        }
      );
    } else {
      // Call the API to create settings
      createSettings(formData, {
        onSuccess: () => {
          setIsSubmitting(false);
        },
        onError: () => {
          setIsSubmitting(false);
        },
      });
    }
  };

  // Handle file uploads
  const handleDashboardLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDashboardLogo(file);
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFavicon(file);
    }
  };

  // Handle social media items
  const addOrUpdateSocialMedia = () => {
    if (newSocialUrl.trim() && newSocialIcon) {
      const newItem = {
        url: newSocialUrl,
        icon: newSocialIcon,
        iconUrl: null, // New items will have a file but no URL yet
      };

      if (editingSocialIndex !== null) {
        // Update existing item
        const updatedItems = [...socialMediaItems];
        updatedItems[editingSocialIndex] = newItem;
        setSocialMediaItems(updatedItems);
        setEditingSocialIndex(null);
      } else {
        // Add new item
        setSocialMediaItems([...socialMediaItems, newItem]);
      }

      // Reset form
      setNewSocialUrl("");
      setNewSocialIcon(null);
      setShowSocialInput(false);
    }
  };

  const editSocialMedia = (index) => {
    const item = socialMediaItems[index];
    setNewSocialUrl(item.url);
    setNewSocialIcon(null); // Can't convert URL to File, so reset this
    setEditingSocialIndex(index);
    setShowSocialInput(true);
  };

  const removeSocialMedia = (index) => {
    const updatedItems = [...socialMediaItems];
    updatedItems.splice(index, 1);
    setSocialMediaItems(updatedItems);
  };

  const cancelSocialInput = () => {
    setShowSocialInput(false);
    setNewSocialUrl("");
    setNewSocialIcon(null);
    setEditingSocialIndex(null);
  };

  return (
    <>
      <div className="my-5">
        <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
      </div>
      <form
        id="settings-form"
        onSubmit={handleSubmit}
        className="flex justify-between gap-5 w-full"
      >
        {/* Form Container - 60% width */}
        <div className="w-4/5 p-6 bg-white border border-[#E5E8EC] rounded-md">
          <h1 className="text-2xl font-semibold mb-6">
            Dashboard Logo & Favicon
          </h1>
          <hr className="mb-3 text-[#CECECE]" />
          <div className="space-y-6">
            <h1 className="mb-2 font-medium text-primary">Dashboard Logo</h1>
            <div className="border  gap-x-10 border-[#DCE1E7] bg-[#F6F8FB] text-black px-4 py-2 rounded-md">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleDashboardLogoUpload}
                />
                <div className="flex flex-col items-center justify-center">
                  <Image src={UploadIcon} alt="icon" className="w-10 h-10" />
                  <p>
                    {dashboardLogoUrl
                      ? "Change Dashboard Logo"
                      : "Click here to add more images."}
                  </p>
                  {dashboardLogo && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {dashboardLogo.name}
                    </p>
                  )}
                </div>
              </label>{" "}
              {dashboardLogoUrl && (
                <div className=" mt-5 flex justify-center">
                  <img
                    src={dashboardLogoUrl}
                    alt="Current Dashboard Logo"
                    className="h-20 object-contain"
                  />
                </div>
              )}
            </div>
            <h1 className="mb-2 font-medium text-primary">Favicon</h1>
            <div className="border border-[#DCE1E7] bg-[#F6F8FB] text-black px-4 py-2 rounded-md">
              {/* Show existing favicon if available */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFaviconUpload}
                />
                <div className="flex flex-col items-center justify-center">
                  <Image src={UploadIcon} alt="icon" className="w-10 h-10" />
                  <p>{faviconUrl ? "Change Favicon" : "Choose Favicon"}</p>
                  {favicon && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {favicon.name}
                    </p>
                  )}
                </div>
              </label>{" "}
              {faviconUrl && (
                <div className="mt-5 flex justify-center">
                  <img
                    src={faviconUrl}
                    alt="Current Favicon"
                    className="h-16 object-contain"
                  />
                </div>
              )}
            </div>
            <div className="border border-[#DCE1E7] text-black px-4 py-2 rounded-md">
              <Text className="mb-2 font-semibold">Social Media</Text>
              <hr className="my-4 text-[#DCE1E7]" />
              {/* Display existing social media items with icon preview */}
              {socialMediaItems.length > 0 && (
                <div className="mb-4 space-y-2">
                  {socialMediaItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon preview - use iconUrl if available, otherwise use the File object */}
                        <div className="w-8 h-8 border rounded-md overflow-hidden flex-shrink-0">
                          {item.iconUrl ? (
                            <img
                              src={item.iconUrl}
                              alt="Social icon"
                              className="w-full h-full object-contain"
                            />
                          ) : item.icon ? (
                            <img
                              src={URL.createObjectURL(item.icon)}
                              alt="Social icon"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                              No icon
                            </div>
                          )}
                        </div>
                        {/* URL text */}
                        <span className="text-blue-500">{item.url}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => editSocialMedia(index)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSocialMedia(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showSocialInput ? (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-3 items-center">
                    <div className="w-[60%]">
                      <TextInput
                        placeholder="URL (e.g. https://facebook.com/yourpage)"
                        value={newSocialUrl}
                        onChange={(e) => setNewSocialUrl(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="w-[30%]">
                      <FileInput
                        placeholder="Select icon"
                        accept="image/*"
                        value={newSocialIcon}
                        onChange={setNewSocialIcon}
                        className="w-full"
                      />
                    </div>
                    {newSocialIcon && (
                      <div className="w-10 h-10 border rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={URL.createObjectURL(newSocialIcon)}
                          alt="Icon preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <Group position="right" spacing="xs" className="mt-2">
                    <Button
                      variant="outline"
                      color="gray"
                      onClick={cancelSocialInput}
                      size="xs"
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="filled"
                      color="blue"
                      onClick={addOrUpdateSocialMedia}
                      size="xs"
                      type="button"
                      disabled={!newSocialUrl.trim() || !newSocialIcon}
                    >
                      {editingSocialIndex !== null ? "Update" : "Add"}
                    </Button>
                  </Group>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSocialInput(true)}
                  className="border border-[#DCE1E7] text-black px-4 py-2 rounded-md"
                >
                  Add New
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="w-2/5 space-y-6">
          {/* Buttons Container - 40% width */}
          <div className="p-4 bg-white border border-[#E5E8EC] rounded-md">
            <h1 className="text-2xl font-semibold mb-2">Publish</h1>
            <hr className="mb-5 text-[#CECECE]" />
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-[#2FB344] text-white rounded-md"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : settingsId
                  ? "Update Settings"
                  : "Save and Publish"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
