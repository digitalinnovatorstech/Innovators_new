"use client";

import React, { useState } from "react";
import { Anchor, Breadcrumbs, Table, Loader } from "@mantine/core";
import Image from "next/image";
import DeleteIcon from "../../../../public/assets/deleteicon.svg";
import SearchIcon from "../../../../public/assets/searchicon.svg";

export default function FormSubmissionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [opened, setOpened] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  const [demoMode, setDemoMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const mockSubmissions = [
    {
      id: 1,
      name: "John Smith",
      connectingFrom: "London, UK",
      reachMeAt: "john.smith@example.com",
      mobileNo: "44785123456",
      workAt: "Tech Solutions Ltd",
      services: "Web Development and UX Design",
      createdAt: "2025-05-09T14:30:22",
      status: "new",
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      connectingFrom: "Barcelona, Spain",
      reachMeAt: "maria@designstudio.com",
      mobileNo: "34612345678",
      workAt: "Creative Design Studio",
      services: "Mobile App Development",
      createdAt: "2025-05-09T10:15:45",
      status: "contacted",
    },
    {
      id: 3,
      name: "Alex Wong",
      connectingFrom: "Singapore",
      reachMeAt: "alex.w@techasia.com",
      mobileNo: "6598765432",
      workAt: "Tech Asia Pte Ltd",
      services: "AI Integration Services",
      createdAt: "2025-05-08T09:20:33",
      status: "new",
    },
    {
      id: 4,
      name: "Sarah Johnson",
      connectingFrom: "New York, USA",
      reachMeAt: "sarah@innovatecorp.com",
      mobileNo: "12125551234",
      workAt: "Innovate Corp",
      services: "Enterprise Software Solutions",
      createdAt: "2025-05-07T16:45:12",
      status: "completed",
    },
    {
      id: 5,
      name: "David Kim",
      connectingFrom: "Seoul, South Korea",
      reachMeAt: "dkim@futuretech.kr",
      mobileNo: "8210987654",
      workAt: "Future Technologies",
      services: "IoT Development",
      createdAt: "2025-05-07T08:30:40",
      status: "contacted",
    },
  ];

  // Pagination data calculation
  const totalItems = 5;
  const totalPages = Math.ceil(totalItems / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  // Filter submissions based on search query
  const filteredSubmissions = searchQuery
    ? mockSubmissions.filter(
        (sub) =>
          sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.reachMeAt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.services.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockSubmissions;

 
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleView = (id) => {
    const submission = mockSubmissions.find((sub) => sub.id === id);
    setSelectedSubmissionId(submission);
    setOpened(true);
  };

  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    
    setPage(1);
  };

 
  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Form Submissions", href: "/form-submissions" },
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
      <div>
        <div className="my-5">
          <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
        </div>
        <div className="p-3 bg-white border border-[#E5E8EC] rounded-md">
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={handleSearchChange}
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
          </div>
          <hr className="mb-6 text-[#CECECE]" />

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="bg-white rounded-sm">
              <Table striped highlightOnHover className="min-w-full">
                <thead className="bg-[#ECF0F3]">
                  <tr>
                    <th className="px-4 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NAME
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EMAIL
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COMPANY
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SUBMITTED ON
                    </th>

                    <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {demoMode &&
                    filteredSubmissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleView(submission.id)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          {submission.id}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-[#206BC8]">
                          {submission.name}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          {submission.reachMeAt}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          {submission.workAt}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          {new Date(submission.createdAt).toLocaleDateString(
                            "en-CA"
                          )}
                        </td>

                        <td
                          className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex space-x-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle delete logic
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

              {(!demoMode || filteredSubmissions.length === 0) && (
                <div className="text-center py-10 text-gray-500">
                  No submissions found.
                </div>
              )}

              {/* Pagination */}
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {startItem} to {endItem} of {totalItems} records
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`${
                      page === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
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
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className={`${
                      page >= totalPages
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
        </div>
      </div>
    </>
  );
}
