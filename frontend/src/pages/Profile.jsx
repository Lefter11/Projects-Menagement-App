import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Profile() {
  const { user, login } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    // mer të dhënat e fundit nga backend (mos u mbështet vetëm te localStorage)
    const load = async () => {
      try {
        const res = await api.get("/users/me");
        setForm((f) => ({
          ...f,
          name: res.data.user.name,
          email: res.data.user.email,
        }));
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      const res = await api.put("/users/me", {
        name: form.name,
        email: form.email,
        password: form.password || undefined, // vetëm nëse është plotësuar
      });

      // update edhe AuthContext
      login(res.data.user, localStorage.getItem("accessToken"));
      setForm((f) => ({ ...f, password: "" }));
      setStatus("Updated successfully");
    } catch (e) {
      console.error(e);
      setStatus("Update failed");
    }
  };

  return (
    <div>
      <h2>My Profile</h2>
      {status && <p>{status}</p>}

      <form onSubmit={handleSubmit} className="form">
        <div>
          <label>Name</label><br/>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Email</label><br/>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>New Password (optional)</label><br/>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Save changes</button>
      </form>
    </div>
  );
}

export default Profile;
