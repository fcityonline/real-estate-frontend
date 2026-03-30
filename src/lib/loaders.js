import { defer } from "react-router-dom";
import apiRequest from "./apiRequest";

export const singlePageLoader = async ({ request, params }) => {
  const res = await apiRequest("/posts/" + params.id);
  return res.data;
};
export const listPageLoader = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const postPromise = apiRequest("/posts" + (query ? `?${query}` : ""));
  return defer({
    postResponse: postPromise,
  });
};

export const profilePageLoader = async () => {
  const postPromise = apiRequest("/users/profilePosts");
  const chatPromise = apiRequest("/chats");
  const inquiryPromise = apiRequest("/inquiries/me");
  const bookingPromise = apiRequest("/bookings/me");
  const aiPromise = apiRequest("/ai/recommendations");
  return defer({
    postResponse: postPromise,
    chatResponse: chatPromise,
    inquiryResponse: inquiryPromise,
    bookingResponse: bookingPromise,
    aiResponse: aiPromise,
  });
};
