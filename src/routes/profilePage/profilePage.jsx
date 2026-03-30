import Chat from "../../components/chat/Chat";
import List from "../../components/list/List";
import "./profilePage.scss";
import apiRequest from "../../lib/apiRequest";
import { Await, Link, useLoaderData, useNavigate } from "react-router-dom";
import { Suspense, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function ProfilePage() {
  const data = useLoaderData();

  const { updateUser, currentUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <Link to="/profile/update">
              <button>Update Profile</button>
            </Link>
          </div>
          <div className="info">
            <span>
              Avatar:
              <img src={currentUser.avatar || "noavatar.jpg"} alt="" />
            </span>
            <span>
              Username: <b>{currentUser.username}</b>
            </span>
            <span>
              E-mail: <b>{currentUser.email}</b>
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="section">
            <div className="title">
              <h1>My List</h1>
              <Link to="/add">
                <button>Create New Post</button>
              </Link>
            </div>
            <div className="sectionContent">
              <Suspense fallback={<p>Loading...</p>}>
                <Await
                  resolve={data.postResponse}
                  errorElement={<p>Error loading posts!</p>}
                >
                  {(postResponse) =>
                    postResponse.data.userPosts.length ? (
                      <List posts={postResponse.data.userPosts} />
                    ) : (
                      <p className="emptyState">No posts yet.</p>
                    )
                  }
                </Await>
              </Suspense>
            </div>
          </div>
          <div className="section">
            <div className="title">
              <h1>Saved List</h1>
            </div>
            <div className="sectionContent">
              <Suspense fallback={<p>Loading...</p>}>
                <Await
                  resolve={data.postResponse}
                  errorElement={<p>Error loading posts!</p>}
                >
                  {(postResponse) =>
                    postResponse.data.savedPosts.length ? (
                      <List posts={postResponse.data.savedPosts} />
                    ) : (
                      <p className="emptyState">No saved places yet.</p>
                    )
                  }
                </Await>
              </Suspense>
            </div>
          </div>
          <div className="section">
            <div className="title">
              <h1>My Inquiries</h1>
            </div>
            <div className="sectionContent">
              <Suspense fallback={<p>Loading...</p>}>
                <Await
                  resolve={data.inquiryResponse}
                  errorElement={<p>Error loading inquiries!</p>}
                >
                  {(inquiries) =>
                    inquiries.data.length ? (
                      <ul className="itemList">
                        {inquiries.data.map((inq) => (
                          <li key={inq.id}>
                            {inq.property.title} – {new Date(inq.createdAt).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="emptyState">No inquiries yet.</p>
                    )
                  }
                </Await>
              </Suspense>
            </div>
          </div>
          <div className="section">
            <div className="title">
              <h1>Upcoming Bookings</h1>
            </div>
            <div className="sectionContent">
              <Suspense fallback={<p>Loading...</p>}>
                <Await
                  resolve={data.bookingResponse}
                  errorElement={<p>Error loading bookings!</p>}
                >
                  {(bookings) =>
                    bookings.data.length ? (
                      <ul className="itemList">
                        {bookings.data.map((b) => (
                          <li key={b.id}>
                            {b.property.title} – {new Date(b.scheduledAt).toLocaleString()} ({b.type})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="emptyState">No bookings yet.</p>
                    )
                  }
                </Await>
              </Suspense>
            </div>
          </div>
          <div className="section">
            <div className="title">
              <h1>Recommended For You</h1>
            </div>
            <div className="sectionContent">
              <Suspense fallback={<p>Loading...</p>}>
                <Await
                  resolve={data.aiResponse}
                  errorElement={<p>AI not available.</p>}
                >
                  {(aiRes) =>
                    aiRes.data && aiRes.data.length ? (
                      <List posts={aiRes.data} />
                    ) : (
                      <p className="emptyState">AI not available.</p>
                    )
                  }
                </Await>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.chatResponse}
              errorElement={<p>Error loading chats!</p>}
            >
              {(chatResponse) => <Chat chats={chatResponse.data}/>}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
