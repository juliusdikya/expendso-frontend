const API_URL = "http://127.0.0.1:8000/api";

export const api = async (endpoint, method = "GET", body) => {
    const token = localStorage.getItem("token");

    const cleanEndpoint = endpoint.replace(/^\/+/, "");
    const url = `${API_URL}/${cleanEndpoint}`;

    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "API Error");
    }

    return data;
};