import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/services/axiosInstance";
import { showToast } from "@/services/toastMessages";

// Update the usebloges function to support pagination
export function useGetBlogs(page = 1, limit = 10, searchQuery = "") {
    return useQuery({
        queryKey: [ "blogs", page, limit, searchQuery ],
        queryFn: async () => {
            let url = `/blogs/getAllBlogs?page=${page}&limit=${limit}`;
            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            const response = await instance.get(url);
            return response.data;
        },
        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to fetch bloges",
                "error"
            );
        },
    });
}
export function useGetBlogById(id, options = {}) {
    return useQuery({
        queryKey: [ "blogs", id ],
        queryFn: async () => {
            if (!id) return null;
            const response = await instance.get(`/blogs/getBlog/${id}`);
            return response.data;
        },
        enabled: !!id && options.enabled !== false,
        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to fetch blog details",
                "error"
            );
        },
        ...options,
    });
}

// Create a new blog
export function useCreateBlog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await instance.post("/blogs/createBlog", data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries([ "blogs" ]);
            showToast(data.message || "Created successfully", "success");
        },
        onError: (error) => {
            showToast(error.response?.data?.message || "Failed ", "error");
        },
    });
}
// // Update a blog
export function useUpdateBlogs() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await instance.put(`/blogs/updateBlog/${id}`, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries([ "blogs" ]);
            queryClient.invalidateQueries([ "blog", variables.id ]);
            showToast(data.message || "Blog updated successfully", "success");
        },
        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to update blog",
                "error"
            );
        },
    });
}

export function useCreateTags() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await instance.post("/tags/create", data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries([ "tags" ]);
            showToast(data.message || "Created successfully", "success");
        },
        onError: (error) => {
            showToast(error.response?.data?.message || "Failed ", "error");
        },
    });
}

export function useGetTags(options = {}) {
    return useQuery({
        queryKey: [ "tags" ],
        queryFn: async () => {
            const response = await instance.get("/tags/getAll");
            return response.data.data;
        },

        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to fetch tags",
                "error"
            );
        },
        ...options,
    });
}


export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ data, type }) => {
            const response = await instance.post(`/categories/create?type=${type}`, {
                name: data.name,
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries([ "category", variables.type ]);
            showToast(data.message || "Created successfully", "success");
        },
        onError: (error) => {
            showToast(error.response?.data?.message || "Failed ", "error");
        },
    });
}

export function useGetCategories(type = "", options = {}) {
    return useQuery({
        // Include the type in the query key for proper caching
        queryKey: [ "category", type ],
        queryFn: async () => {
            // Add the type as a query parameter if it exists
            const url = type ? `/categories/getAll?type=${type}` : "/categories/getAll";
            const response = await instance.get(url);
            return response.data.data;
        },
        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to fetch categories",
                "error"
            );
        },
        ...options,
    });
}



export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const response = await instance.delete(`tags/delete/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries([ "tags" ]);
            showToast(data.message || " Deleted successfully", "success");
        },
        onError: (error) => {
            showToast(error.response?.data?.message || "Failed to Delete ", "error");
        },
    });
}
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, type = "category" }) => {

            const response = await instance.delete(`categories/delete/${id}?type=${type}`);
            return { data: response.data, type };
        },
        onSuccess: (result) => {

            queryClient.invalidateQueries([ "category", result.type ]);
            showToast(result.data.message || "Deleted successfully", "success");
        },
        onError: (error) => {
            showToast(error.response?.data?.message || "Failed to Delete", "error");
        },
    });
}
export function useDeleteBlog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const response = await instance.delete(`/blogs/deleteBlog/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries([ "blogs" ]);
            showToast(data.message || " Deleted successfully", "success");
        },
        onError: (error) => {
            showToast(error.response?.data?.message || "Failed to Delete ", "error");
        },
    });
}
export function useSearchBlogs(role) {
    return useQuery({
        queryKey: [ "careers", "search", role ],
        queryFn: async () => {
            const response = await instance.get(`/api/careers/search`, {
                params: { role }
            });
            return response.data;
        },
        enabled: !!role, // Only run the query if a role is provided
        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to search for careers",
                "error"
            );
        },
    });
}