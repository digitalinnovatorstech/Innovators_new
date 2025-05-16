"use client";

import React, { useState, useEffect } from "react";
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
import { useGetCategories } from "../blogs/hooks/blogCRUDapis";
import { useGetCareers, useDeleteCareer, useSearchCareers } from "./hooks/useCRUDapis";
import { useRouter } from "next/navigation";

export default function CareersPage() {
  const router = useRouter();
  const [ page, setPage ] = useState(1);
  const [ limit, setLimit ] = useState(10);
  const [ searchQuery, setSearchQuery ] = useState("");
  const [ departmentMap, setDepartmentMap ] = useState({});

  // Modal state
  const [ opened, setOpened ] = useState(false);
  const [ selectedCareerId, setSelectedCareerId ] = useState(null);

  // Fetch careers data
  const {
    data: careersData,
    isLoading,
    isError,
    refetch
  } = useGetCareers(page, limit);

  // Search careers data
  const {
    data: searchData,
    isLoading: isLoadingSearch,
    isError: isErrorSearch
  } = useSearchCareers(searchQuery, {
    enabled: !!searchQuery
  });

  // Determine which data to display
  const displayData = searchQuery ? searchData : careersData;

  const { mutate: deleteCareer } = useDeleteCareer();

  const { data: departmentsData } = useGetCategories("department");

  useEffect(() => {
    if (departmentsData?.rows) {
      const deptMap = {};
      departmentsData.rows.forEach((dept) => {
        deptMap[ dept.id ] = dept.name;
      });
      setDepartmentMap(deptMap);
    }
  }, [ departmentsData ]);

  // Handle search input change with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        // Reset to first page when searching
        setPage(1);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [ searchQuery ]);

  // Handle delete
  const handleDelete = (id) => {
    setSelectedCareerId(id);
    setOpened(true);
  };

  const confirmDelete = () => {
    if (selectedCareerId) {
      deleteCareer(selectedCareerId, {
        onSuccess: () => {
          refetch();
          setOpened(false);
        },
      });
    }
  };

  // Handle edit
  const handleEdit = (id) => {
    router.push(`/careers/${id}`);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Careers", href: "/careers" },
  ].map((item, index) => (
    <Anchor
      href={item.href}
      key={index}
      className="text-[#206BC4] hover:underline"
    >
      {item.title}
    </Anchor>
  ));

  // Calculate pagination details
  const totalItems = displayData?.totalItems || 0;
  const totalPages = displayData?.totalPages || 1;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <>
      <div>
        <div className="my-5">
          <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
        </div>
        <div className="p-3 bg-white border border-[#E5E8EC] rounded-md">
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 pl-10 border bg-white border-[#CECECE] rounded-md focus:outline-none"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Image
                  src={SearchIcon}
                  alt="Search Icon"
                  width={20}
                  height={20}
                />
              </div>
            </div>

            <Link
              href="/careers/createcareer"
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
            <div className="text-center py-10 text-red-500">loading...</div>
          ) : (
            <div
              className="bg-white rounded-sm flex flex-col"
              style={{ height: "calc(100vh - 300px)" }}
            >
              {/* Table with scroll */}
              <div className="overflow-auto flex-grow">
                <Table striped highlightOnHover className="min-w-full">
                  <thead className="bg-[#ECF0F3] sticky top-0 z-10">
                    <tr >
                      <th className="px-4 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ROLE
                      </th>
                      <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DEPARTMENT
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
                    {displayData?.data?.map((career, index) => (
                      <tr
                        key={career.id || `career-${index}`}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/careers/${career.id}`)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          {career.id || "N/A"}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-[#206BC8]">
                          {career.role}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          {departmentMap[ career.department ] ||
                            `Department ID: ${career.department}`}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          {new Date(career.createdAt).toLocaleDateString("en-CA")}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs w-20 inline-flex justify-center items-center leading-5 font-medium rounded-md ${career.status === "published"
                              ? "bg-[#2FB344] text-white"
                              : "bg-[#206BC4] text-white"
                              }`}
                          >
                            {career.status === "published" ? "Published" : "Draft"}
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
                                handleEdit(career.id);
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
                                handleDelete(career.id);
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

                {displayData?.data?.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    No careers found.
                  </div>
                )}
              </div>

              {/* Fixed pagination at bottom */}
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-200 mt-auto">
                <div className="text-sm text-gray-700">
                  Showing {startItem} to {endItem} of {totalItems} records
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
                    { length: totalPages },
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
                    disabled={page >= totalPages}
                    className={`${page >= totalPages
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
              <p>Are you sure you want to delete this career?</p>
              <div className="flex space-x-5">
                <Button onClick={() => setOpened(false)} color="gray">
                  Cancel
                </Button>
                <Button color="red" onClick={confirmDelete} >
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