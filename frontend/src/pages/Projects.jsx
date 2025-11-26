import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { accessToken } = useAuth();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setProjects(res.data);
    } catch (e) {
      toast.error('Failed to load projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        '/projects',
        { name, description },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Project created');
      setName('');
      setDescription('');
      fetchProjects();
    } catch (e) {
      toast.error('Failed to create project');
    }
  };

  return (
    <div>
      <h2>Your Projects</h2>
      <form onSubmit={handleCreate} className="form">
        <input
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add project</button>
      </form>

      <ul className="list">
        {projects.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;