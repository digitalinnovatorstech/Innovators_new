"use client";

import React, { useState, useEffect } from "react";
import { Anchor, Breadcrumbs, Table, Pagination, Modal, Button } from "@mantine/core";
import EditIcon from "../../../../public/assets/editicon.svg";
import DeleteIcon from "../../../../public/assets/deleteicon.svg";
import SearchIcon from "../../../../public/assets/searchicon.svg";
import Image from "next/image";
import Link from "next/link";
import { useDeleteBlog, useGetBlogs } from "./hooks/blogCRUDapis";
import { useRouter } from "next/navigation";


export default function BlogManagementPage() {
  const router = useRouter();
  const [ page, setPage ] = useState(1);
  const [ limit, setLimit ] = useState(10);
  const [ searchQuery, setSearchQuery ] = useState("");
  const [ selectAll, setSelectAll ] = useState(false);
  const [ selectedItems, setSelectedItems ] = useState([]);


  const { data: blogsData, isLoading, isError } = useGetBlogs(
    page,
    limit,
    searchQuery
  );
  const [ opened, setOpened ] = useState(false);
  const [ blogToDelete, setBlogToDelete ] = useState(null);
  const { mutate: deleteBlog } = useDeleteBlog();
  const handleDeleteClick = (e, blog) => {
    e.stopPropagation();
    setBlogToDelete(blog);
    setOpened(true);
  }; const confirmDelete = () => {
    if (blogToDelete) {
      deleteBlog(blogToDelete.id, {
        onSuccess: () => {
          setOpened(false);
          setBlogToDelete(null);
        }
      });
    }
  };

  const blogs = blogsData?.data || [];
  const totalItems = blogsData?.totalItems || 0;
  const totalPages = blogsData?.totalPages || 1;
  const currentPage = blogsData?.currentPage || 1;


  useEffect(() => {
    setSelectedItems([]);
    setSelectAll(false);
  }, [ blogsData ]);

  // Breadcrumb items
  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Blog", href: "/blogs" },
  ].map((item, index) => (
    <Anchor
      href={item.href}
      key={index}
      className="text-[#206BC4] hover:underline"
    >
      {item.title}
    </Anchor>
  ));

  const handleCheckboxChange = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([ ...selectedItems, id ]);
    }
  };

  const handleSelectAllChange = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      // Select all items
      setSelectedItems(blogs.map(blog => blog.id));
    } else {
      // Deselect all items
      setSelectedItems([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.length} selected blog(s)?`
      )
    ) {


      // Reset selection
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(e.target.value);
      setPage(1);
    }
  };



  const getCategoryName = (categoryId) => {

    return categoryId || 'Uncategorized';
  };

  return (
    <>
      <div className="">
        <div className="my-5 ">
          <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
        </div>
        <div className="p-3 bg-white border border-[#E5E8EC] rounded-md">
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="px-4 py-2 pl-10 border bg-white border-[#CECECE] rounded-md focus:outline-none"
                onKeyDown={handleSearch}
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
            </div>
            <div className="flex gap-4">
              <Link
                href="/blogs/createblog"
                className="px-4 py-2 bg-[#206BC4] text-white rounded-md"
              >
                + Create
              </Link>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className={`flex items-center gap-2 px-4 py-2 border ${selectedItems.length > 0
                  ? "bg-red-500 text-white border-red-500"
                  : "border-[#DCE1E7] text-black"
                  } rounded-md transition-colors duration-200`}
                disabled={selectedItems.length === 0}
              >
                {selectedItems.length > 0 ? `Delete (${selectedItems.length})` : "Delete"}
              </button>
            </div>
          </div>
          <hr className="mb-6 text-[#CECECE]" />

          {isLoading ? (
            <div className="text-center py-10">Loading blogs...</div>
          ) : isError ? (
            <div className="text-center py-10 text-red-500">Error loading blogs</div>
          ) : (
            <div className="bg-white rounded-sm overflow-hidden">
              <Table striped highlightOnHover>
                <thead className="bg-[#ECF0F3] ">
                  <tr>
                    <th className="px-4 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                      />
                    </th>
                    <th className="px-4 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IMAGES
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TITLE
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CATEGORIES
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AUTHOR
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  {blogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className={`hover:bg-gray-50 ${selectedItems.includes(blog.id) ? "bg-blue-50" : ""
                        }`}
                      onClick={() => router.push(`/blogs/${blog.id}`)}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="form-checkbox"
                          checked={selectedItems.includes(blog.id)}
                          onChange={() => handleCheckboxChange(blog.id)}
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{blog.id}</td>
                      <td className="px-8 py-4 whitespace-nowrap flex justify-center">
                        {blog.image ? (
                          <img
                            src={blog.image}
                            alt={blog.title || "Blog image"}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No img</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-[#206BC8]">
                        {blog.title}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        {getCategoryName(blog.category)}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">-</td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        {new Date(blog.createdAt).toLocaleDateString("en-CA")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs w-20 inline-flex justify-center items-center leading-5 font-medium rounded-md ${blog.status === 'published'
                          ? 'bg-[#2FB344] text-white'
                          : 'bg-[#206BC4] text-white'
                          }`}>
                          {blog.status === 'published' ? 'Published' : 'Draft'}
                        </span>

                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-4">
                          <Link href={`/blogs/edit/${blog.id}`} className="text-blue-600 hover:text-blue-900">
                            <Image
                              src={EditIcon}
                              alt="Edit"
                              width={20}
                              height={20}
                            />
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={(e) => handleDeleteClick(e, blog)}
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

              {blogs.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No blogs found
                </div>
              )}

              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {blogs.length > 0 ? (currentPage - 1) * limit + 1 : 0} to{" "}
                  {Math.min(currentPage * limit, totalItems)} of {totalItems} records
                </div>
                <Pagination
                  total={totalPages}
                  value={currentPage}
                  onChange={setPage}
                  size="sm"
                />
              </div>
            </div>
          )}

          <Modal opened={opened} onClose={() => setOpened(false)} centered>
            <div className="flex flex-col justify-center items-center gap-y-8 p-5">
              <p>Are you sure you want to delete this blog?</p>

              <div className="flex space-x-5">
                <Button onClick={() => setOpened(false)} color="gray">
                  Cancel
                </Button>
                <Button color="red" onClick={confirmDelete}>
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
