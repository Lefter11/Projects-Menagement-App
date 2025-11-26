import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ProjectDetail = () => {
  const { id } = useParams();
  const { accessToken, user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const [members, setMembers] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState("");

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setProject(res.data);
    } catch {
      toast.error("Failed to load project");
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/projects/${id}/members`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // owner + members
      setMembers([res.data.owner, ...res.data.members]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?project_id=${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchMembers();
  }, [id]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.post(
        "/tasks",
        { title, project_id: Number(id) },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Task added");
      setTitle("");
      fetchTasks();
    } catch {
      toast.error("Failed to add task");
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    setMemberError("");
    if (!memberEmail.trim()) return;

    try {
      const res = await api.post(
        `/projects/${id}/members`,
        { email: memberEmail },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const newMember = res.data.user
        ? { ...res.data.user, role: res.data.role || "member" }
        : res.data;

      setMembers((prev) => [...prev, newMember]);
      setMemberEmail("");
      toast.success("Member added");
    } catch (err) {
      console.error(err);
      setMemberError(
        err?.response?.data?.message || "Could not add member"
      );
    }
  };

  const removeMember = async (memberId) => {
    try {
      await api.delete(`/projects/${id}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Member removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove member");
    }
  };

  return (
    <div>
      {project && (
        <>
          <h2>{project.name}</h2>
          <p>{project.description}</p>
        </>
      )}

      {/* MEMBERS */}
      <h3>Members</h3>

      <form onSubmit={addMember} className="form" >
        <input
          type="email"
          placeholder="Add member by email"
          value={memberEmail}
          onChange={(e) => setMemberEmail(e.target.value)}
        />
        <button type="submit" style={{ marginLeft: "8px" }}>
          Add
        </button>
      </form>

      {memberError && <p style={{ color: "red" }}>{memberError}</p>}

      <ul>
        {members.map((m) => (
          <li key={m.id}>
            {m.name} ({m.email}) {m.role && <strong> – {m.role}</strong>}
            {}
            {project &&
              user &&
              project.owner_id === user.id &&
              m.role !== "owner" && (
                <button
                  style={{ marginLeft: "8px" }}
                  onClick={() => removeMember(m.id)}
                >
                  Remove
                </button>
              )}
          </li>
        ))}
      </ul>

      {/* TASKet */}
      <h3>Tasks</h3>
      <form onSubmit={handleAddTask} className="form">
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add task</button>
      </form>

      <ul className="list">
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} - <strong>{t.status}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectDetail;
