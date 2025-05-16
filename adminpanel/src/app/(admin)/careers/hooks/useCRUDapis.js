import instance from "@/services/axiosInstance";
import { showToast } from "@/services/toastMessages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreateCareer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await instance.post("/careers/create", data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries([ "careers" ]);
            showToast(data.message || "Created successfully", "success");
        },
        onError: (error) => {
            showToast(error.response?.data?.message || "Failed ", "error");
        },
    });
}

export function useGetCareers(page = 1, limit = 10, searchQuery = "") {
    return useQuery({
        queryKey: [ "careers", page, limit, searchQuery ],
        queryFn: async () => {
            let url = `/careers/getAll?page=${page}&limit=${limit}`;
            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            const response = await instance.get(url);
            return response.data;
        },
        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to fetch careers",
                "error"
            );
        },
    });
}
export function useGetCareerById(id, options = {}) {
    return useQuery({
        queryKey: [ "career", id ],
        queryFn: async () => {
            if (!id) return null;
            const response = await instance.get(`/careers/get/${id}`);
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
export function useUpdateCareer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await instance.put(`/careers/update/${id}`, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries([ "careers" ]);
            queryClient.invalidateQueries([ "career", variables.id ]);
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
export function useDeleteCareer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const response = await instance.delete(`careers/delete/${id}`);
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

export function useSearchCareers(role) {
    return useQuery({
        queryKey: [ "careers", "search", role ],
        queryFn: async () => {
            try {
                const response = await instance.get(`/careers/search`, {
                    params: { role }
                });
                return response.data;
            } catch (error) {
                console.error("Error searching careers:", error);
                throw error;
            }
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

