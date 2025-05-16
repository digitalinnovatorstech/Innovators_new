import instance from "@/services/axiosInstance";
import { showToast } from "@/services/toastMessages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await instance.post("/settings/create", data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries([ "settings" ]);
            showToast(data.message || "Created successfully", "success");
        },
        onError: (error) => {
            showToast(error.response?.data?.message || "Failed ", "error");
        },
    });
}
export function useGetAllSettings() {
    return useQuery({
        queryKey: [ "settings" ],
        queryFn: async () => {
            const response = await instance.get(`/settings/getAll`);
            return response.data;
        },
        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to fetch settings",
                "error"
            );
        },
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, formData }) => {
            // Make sure the endpoint matches your API
            const response = await instance.put(`/settings/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ 'settings' ] });
            showToast("Settings updated successfully", "success");
        },
        onError: (error) => {
            showToast(
                error.response?.data?.message || "Failed to update settings",
                "error"
            );
        },
    });
}
