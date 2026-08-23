import apiClient from "./apiClient";

const contactService = {
  sendContact: (data) => {
    return apiClient.post("/users/contacts", data);
  },
  
  getAllContacts: () => {
    return apiClient.get("/users/contacts");
  },
  
  replyContact: (id, replyMessage) => {
    return apiClient.put(`/users/contacts/${id}/reply`, { replyMessage });
  },

  updateReply: (messageId, replyId, replyMessage) => {
    return apiClient.put(`/users/contacts/${messageId}/reply/${replyId}`, { replyMessage });
  },

  deleteReply: (messageId, replyId) => {
    return apiClient.delete(`/users/contacts/${messageId}/reply/${replyId}`);
  }
};

export default contactService;
