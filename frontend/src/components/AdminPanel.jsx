import { useEffect, useState } from "react";
import api from "../api/api";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    api
      .get("/users")
      .then((response) => setUsers(response.data))
      .catch((err) => {
        console.log(err);
        window.location.href = "/login";
      });
  }, []);
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const toggleUserSelection = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const blockUsers = () => {
    api
      .post("/block-users", { userIds: selectedUsers })
      .then(() => {
        setUsers(
          users.map((user) =>
            selectedUsers.includes(user.id)
              ? { ...user, status: "blocked" }
              : user
          )
        );
        setSelectedUsers([]);
      })
      .catch((err) => {
        setError("Error blocking users");
        console.error("Error blocking users", err);
      });
  };

  const unblockUsers = () => {
    api
      .post("/unblock-users", { userIds: selectedUsers })
      .then(() => {
        setUsers(
          users.map((user) =>
            selectedUsers.includes(user.id)
              ? { ...user, status: "active" }
              : user
          )
        );
        setSelectedUsers([]);
      })
      .catch((err) => {
        console.error("Error unblocking users", err);
        setError("Error unblocking users");
      });
  };

  const deleteUsers = () => {
    api
      .post("/delete-users", { userIds: selectedUsers })
      .then((response) => {
        console.log("Delete response:", response.data);
        setUsers(users.filter((user) => !selectedUsers.includes(user.id)));
        setSelectedUsers([]);
        alert("Users deleted successfully");
      })
      .catch((err) => {
        console.error(
          "Error deleting users:",
          err.response ? err.response.data : err.message
        );
        setError(`Failed to delete users:`);
      });
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">User Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <button
          className="btn btn-danger mr-2"
          onClick={blockUsers}
          style={{ marginRight: "15px" }}
        >
          Block
        </button>
        <button
          className="btn btn-info mr-2"
          onClick={unblockUsers}
          style={{ marginRight: "15px" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-unlock"
            viewBox="0 0 16 16"
          >
            <path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2M3 8a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1z" />
          </svg>
        </button>
        <button className="btn btn-warning" onClick={deleteUsers}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-trash"
            viewBox="0 0 16 16"
          >
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
          </svg>
        </button>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="thead-light">
          <tr>
            <th>
              <input type="checkbox" onChange={toggleSelectAll} />
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Last Login</th>
            <th>Registration Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleUserSelection(user.id)}
                />
              </td>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {user.last_login
                  ? new Date(user.last_login).toLocaleString()
                  : "Never logged in"}
              </td>
              <td>{new Date(user.registration_time).toLocaleString()}</td>
              <td>{user.status === "active" ? "Active" : "Blocked"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
