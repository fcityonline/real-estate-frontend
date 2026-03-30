import { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
const MOBILE_BREAKPOINT = 738;

function Chat({ chats }) {
  const [chat, setChat] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT);
  const [showListOnMobile, setShowListOnMobile] = useState(true);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const messageEndRef = useRef();

  useEffect(() => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }), [chat]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      if (!mobile) {
        setShowListOnMobile(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpenChat = async (id, receiver) => {
    if (!receiver?.id) {
      console.error("Chat receiver is missing for chat", id);
      return;
    }

    const res = await apiRequest.get("/chats/" + id);
    setChat({ ...res.data, receiver });

    if (isMobile) {
      setShowListOnMobile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = new FormData(e.target).get("text")?.toString().trim();

    if (!text || !chat?.id) return;

    const res = await apiRequest.post("/messages/" + chat.id, { text });
    setChat((prev) => ({ ...prev, messages: [...(prev?.messages || []), res.data] }));
    socket.emit("sendMessage", { receiverId: chat?.receiver?.id, data: res.data });
    e.target.reset();
  };

  useEffect(() => {
    if (!chat || !socket) return;

    const readChat = async () => apiRequest.put("/chats/read/" + chat.id);

    const handleGetMessage = (data) => {
      if (data.chatId === chat.id) {
        setChat((prev) => ({ ...prev, messages: [...prev.messages, data] }));
        readChat();
      }
    };

    socket.on("getMessage", handleGetMessage);
    return () => socket.off("getMessage", handleGetMessage);
  }, [socket, chat]);
  
  return (
    
    <div className={`chat${isMobile ? " mobile" : ""}`}>
      {(!isMobile || showListOnMobile) && (
        
        
        <div className="messages">
          {/* <h2 <i class="fa-thin fa-message" style="color: rgb(0, 0, 0);"></i> >Select a conversation</h2> */}
<h2 className="chatTitle">
  Messenger ‎
    <i className="fa-solid fa-comments"></i>
</h2>
          {Array.isArray(chats) && chats.length > 0 ? (
            chats.map((c) => {
              const receiver = c.receiver || {
                username: "Unknown",
                avatar: "/noavatar.jpg",
                id: null,
              };
              const seen = Array.isArray(c.seenBy) && c.seenBy.includes(currentUser.id);
              
              return (
                <div
                key={c.id}
                className="message"
                onClick={() => handleOpenChat(c.id, receiver)}
                style={{ backgroundColor: seen ? "#fff" : "#fecd514e" }}
                >
                  <img src={receiver.avatar || "/noavatar.jpg"} alt="" />
                  <div className="text">
                    <span>{receiver.username}</span>
                    <p>{c.lastMessage || "Start the conversation"}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="emptyChats">No chats available.</p>
          )}
        </div>
      )}

      {chat && (!isMobile || !showListOnMobile) && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              {isMobile && (
                <button className="back" type="button" onClick={() => setShowListOnMobile(true)}>
                  {"< Back"}
                </button>
              )}
              <img src={chat.receiver.avatar || "/noavatar.jpg"} alt="" />
              <span>{chat.receiver.username}</span>
            </div>
            {!isMobile && (
              <button className="close" type="button" onClick={() => setChat(null)}>
                Close
              </button>
            )}
          </div>
          <div className="center">
            {chat.messages.map((m) => {
              const isOwn = m.userId === currentUser.id;

              return (
                <div key={m.id} className={`chatMessage${isOwn ? " own" : ""}`}>
                  <p>{m.text}</p>
                  <span>{format(m.createdAt)}</span>
                </div>
              );
            })}
            <div ref={messageEndRef}></div>
          </div>
          <form className="bottom" onSubmit={handleSubmit}>
            <textarea name="text" placeholder="Type a message..." rows={2} />
            <button type="submit">Send</button>
          </form>
        </div>
      )}

      {!chat && !isMobile && (
        <div className="chatPlaceholder">
          
          <p>Choose a chat to read messages and send replies.</p>
        </div>
      )}
    </div>
  );
}

export default Chat;
