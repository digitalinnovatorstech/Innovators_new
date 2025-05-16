"use client";

import React, { useEffect, useState } from "react";
import {
  Anchor,
  Breadcrumbs,
  Table,
  Loader,
  Modal,
  Button,
} from "@mantine/core";
import EditIcon from "../../../../public/assets/editicon.svg";
import DeleteIcon from "../../../../public/assets/deleteicon.svg";
import SearchIcon from "../../../../public/assets/searchicon.svg";
import Image from "next/image";
import Link from "next/link";
import { useHeroes, useDeleteHero, useSearchHero } from "./hooks/heroCRUDapis";
import { useRouter } from "next/navigation";

export default function HeroManagementPage() {
  const router = useRouter();
  const [ page, setPage ] = useState(1);
  const [ limit, setLimit ] = useState(10);
  const [ searchQuery, setSearchQuery ] = useState("");
  const [ searchInput, setSearchInput ] = useState("");

  const [ opened, setOpened ] = useState(false);
  const [ selectedHeroId, setSelectedHeroId ] = useState(null);

  // Main data fetch for paginated heroes
  const { data, isLoading, isError, refetch } = useHeroes(
    page,
    limit,
    searchQuery
  );

  // Search-specific fetch for heroes matching the title
  const {
    data: searchData,
    isLoading: isLoadingSearch,
    isError: isErrorSearch
  } = useSearchHero(searchQuery, {
    enabled: !!searchQuery
  });

  const { mutate: deleteHero } = useDeleteHero();

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1); // Reset to first page when searching
  };

  // Handle search input change with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchInput) {
        setSearchQuery(searchInput);
        setPage(1); // Reset to first page when searching
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [ searchInput ]);

  const handleDelete = (id) => {
    setSelectedHeroId(id);
    setOpened(true);
  };

  const confirmDelete = () => {
    if (selectedHeroId) {
      deleteHero(selectedHeroId, {
        onSuccess: () => {
          refetch();
          setOpened(false);
        },
      });
    }
  };

  const handleEdit = (id) => {
    router.push(`/heromanagement/${id}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Hero Management", href: "/heromanagement" },
  ].map((item, index) => (
    <Anchor
      href={item.href}
      key={index}
      className="text-[#206BC4] hover:underline"
    >
      {item.title}
    </Anchor>
  ));

  // Determine which data to display - use searchData if available, otherwise use regular data
  const displayData = searchQuery && searchData ? searchData : data;

  return (
    <>
      <div>
        <div className="my-5">
          <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
        </div>
        <div className="p-3 bg-white border border-[#E5E8EC] rounded-md">
          <div className="flex justify-between items-center mb-6">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="px-4 py-2 pl-10 border bg-white border-[#CECECE] rounded-md focus:outline-none"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              >
                <Image
                  src={SearchIcon}
                  alt="Search Icon"
                  width={20}
                  height={20}
                />
              </button>
            </form>

            <Link
              href="/heromanagement/createnew"
              className="px-4 py-2 bg-[#206BC4] text-white rounded-md"
            >
              + Create
            </Link>
          </div>
          <hr className="mb-6 text-[#CECECE]" />

          {isLoading || isLoadingSearch ? (
            <div className="flex justify-center py-10">
              <Loader size="lg" />
            </div>
          ) : isError || isErrorSearch ? (
            <div className="text-center py-10 text-red-500">Error loading data. Please try again.</div>
          ) : (
            <div
              className="bg-white rounded-sm flex flex-col"
              style={{ height: "calc(100vh - 300px)" }}
            >
              {/* Table with scroll */}
              <div className="overflow-auto flex-grow">
                <Table striped highlightOnHover className="min-w-full">
                  <thead className="bg-[#ECF0F3] sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TITLE
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SUBTITLE
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CREATED AT
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OPERATIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayData?.data?.map((item, index) => (
                      <tr
                        key={item.id || `hero-${index}`}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          router.push(`/heromanagement/${item.id}`)
                        }
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          {item.id || "N/A"}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-[#206BC8]">
                          {item.title}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          {item.subtitle}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString("en-CA")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs w-20 inline-flex justify-center items-center leading-5 font-medium rounded-md ${item.status === "publish"
                              ? "bg-[#2FB344] text-white"
                              : "bg-[#206BC4] text-white"
                              }`}
                          >
                            {item.status === "publish" ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex space-x-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item.id);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Image
                                src={EditIcon}
                                alt="Edit"
                                width={20}
                                height={20}
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Image
                                src={DeleteIcon}
                                alt="Delete"
                                width={20}
                                height={20}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Fixed pagination at bottom */}
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-200 mt-auto">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, displayData?.totalItems || 0)} of{" "}
                  {displayData?.totalItems || 0} records
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`${page === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: displayData?.totalPages || 0 },
                    (_, i) => i + 1
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={
                        p === page
                          ? "px-3 py-1 border border-blue-600 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                          : "px-3 py-1 text-black rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      }
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= (displayData?.totalPages || 0)}
                    className={`${page >= (displayData?.totalPages || 0)
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal for Delete Confirmation */}
          <Modal opened={opened} onClose={() => setOpened(false)} centered>
            <div className="flex flex-col justify-center items-center gap-y-8 p-5">
              <p>Are you sure you want to delete this hero?</p>
              <div className="flex space-x-5">
                <Button onClick={() => setOpened(false)} color="gray">
                  Cancel
                </Button>
                <Button onClick={confirmDelete} color="red">
                  Confirm
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
}