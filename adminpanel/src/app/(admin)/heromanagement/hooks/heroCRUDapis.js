import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/services/axiosInstance";
import { showToast } from "@/services/toastMessages";

// Update the useHeroes function to support pagination
export function useHeroes(page = 1, limit = 10, searchQuery = "") {
    return useQuery({
        queryKey: [ "heroes", page, limit, searchQuery ],
        queryFn: async () => {
            let url = `/heroManagement/get?page=${page}&limit=${limit}`;
            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            const response = await instance.get(url);
            return response.data;
        },
        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to fetch heroes",
                "error"
            );
        },
    });
}

// Fetch a single hero by ID
export function useHeroById(id, options = {}) {
    return useQuery({
        queryKey: [ "hero", id ],
        queryFn: async () => {
            if (!id) return null;
            const response = await instance.get(`/heroManagement/get/${id}`);
            return response.data;
        },
        enabled: !!id && options.enabled !== false,
        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to fetch hero details",
                "error"
            );
        },
        ...options,
    });
}
// Create a new hero
export function useCreateHero() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await instance.post("/heroManagement/create", data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries([ "heroes" ]);
            showToast(data.message || "Created successfully", "success");
        },
        onError: (error) => {
            showToast(error.response?.data?.message || "Failed to create ", "error");
        },
    });
}

// Update a hero
export function useUpdateHero() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await instance.put(`/heroManagement/update/${id}`, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries([ "heroes" ]);
            queryClient.invalidateQueries([ "hero", variables.id ]);
            showToast(data.message || "Hero updated successfully", "success");
        },
        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to update hero",
                "error"
            );
        },
    });
}

// Delete a hero
export function useDeleteHero() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const response = await instance.delete(`heroManagement/delete/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries([ "heroes" ]);
            showToast(data.message || " Deleted successfully", "success");
        },
        onError: (error) => {
            showToast(error.response?.data?.message || "Failed to Delete ", "error");
        },
    });
}

export function useSearchHero(title) {
    return useQuery({
        queryKey: [ "careers", "search", title ],
        queryFn: async () => {
            try {
                const response = await instance.get(`/heroManagement/search`, {
                    params: { title }
                });
                return response.data;
            } catch (error) {
                console.error("Error searching careers:", error);
                throw error;
            }
        },
        enabled: !!title, // Only run the query if a role is provided
        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to search for careers",
                "error"
            );
        },
    });
}

