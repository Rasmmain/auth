import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // login
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/register");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });
      const { token } = response.data;

      if (!token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", token);
      console.log(token);

      navigate("/admin-panel");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error || "Invalid credentials or blocked account."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-4">
          <h3 className="text-center">Log In</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block mt-3"
              disabled={isLoading}
              style={{ marginRight: "15px" }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <button
              type="button"
              onClick={handleLoginRedirect}
              className="btn btn-success btn-block mt-3"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
