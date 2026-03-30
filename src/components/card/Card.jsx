import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import "./card.scss";

function Card({ item }) {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [chatError, setChatError] = useState("");

  const handleMessageClick = async () => {
    setChatError("");
    try {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      const receiverId = item.userId || item.user?.id;
      if (!receiverId) {
        setChatError("Unable to start a chat for this listing right now.");
        return;
      }

      if (receiverId === currentUser.id) {
        setChatError("You cannot send a message to yourself.");
        return;
      }

      // Create or get chat with the post owner, then go to profile chat view
      await apiRequest.post("/chats", { receiverId });
      navigate("/profile");
    } catch (err) {
      console.log(err);
      setChatError("Failed to start chat. Please try again.");
    }
  };

  return (
    <div className="card">
      <Link to={`/property/${item.id}/${item.slug}`} className="imageContainer">
        <img src={item.images[0]} alt="" />
      </Link>
      <div className="textContainer">
        <h2 className="title">
          <Link to={`/property/${item.id}/${item.slug}`}>{item.title}</Link>
        </h2>
        <p className="address">
          <img src="/pin.png" alt="" />
          <span>{item.address}</span>
        </p>
        <p className="price">₹ {item.price}</p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedroom} bedroom</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="" />
              <span>{item.bathroom} bathroom</span>
            </div>
          </div>
          <div className="icons">
            <div className="icon">
              <img src="/save.png" alt="" />
            </div>
            <div
              className="icon"
              onClick={handleMessageClick}
              style={{ cursor: item.userId === currentUser?.id ? "not-allowed" : "pointer" }}
            >
              <img src="/chat.png" alt="" />
            </div>
          </div>
          {chatError && <p className="cardError">{chatError}</p>}
        </div>
      </div>
    </div>
  );
}

export default Card;
