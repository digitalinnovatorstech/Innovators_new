export default function convertToFormData(rawData) {
    if (typeof rawData !== 'object' || rawData === null) {
        throw new Error('Input data must be an object.');
    }

    const formData = new FormData();
    Object.entries(rawData).forEach(([ key, value ]) => {
        formData.append(key, value);
    });

    return formData;
}
