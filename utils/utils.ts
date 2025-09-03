

export const api = {
  API_URL: "http://192.168.1.98:3000",

  get: async (endpoint: string) => {
    const res = await fetch(`${api.API_URL}${endpoint}`);
    return res.json();
  },
  post: async (endpoint: string, body: any) => {
    const res = await fetch(`${api.API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  put: async (endpoint: string, body: any) => {
    const res = await fetch(`${api.API_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  delete: async (endpoint: string) => {
    const res = await fetch(`${api.API_URL}${endpoint}`, { method: "DELETE" });
    return res.json();
  },

  createGroup: async (
    groupName: string,
    participantIds: string[],
    creatorId: string
  ) => {
    const res = await fetch(`${api.API_URL}/grupos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: groupName,
        participants: participantIds,
        created_by: creatorId,
      }),
    });
    return res.json();
  },
};
