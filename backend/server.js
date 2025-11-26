const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/users.route');

const app = express();

// Logim i thjesht= i çdo kerkese
app.use((req, res, next) => {
  console.log('REq:', req.method, req.url);
  next();
});

app.use(
  cors({
    origin:'https://projects-menagement-frontend.onrender.com',
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// mbush req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'Project Management API running' });
});

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

module.exports = app;
