import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    const [tasks, setTasks] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterPriority, setFilterPriority] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('');
    const [editingTask, setEditingTask] = React.useState(null);
  
    // Load tasks from localStorage when component mounts
    React.useEffect(() => {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    }, []);
  
    // Save tasks to localStorage whenever tasks change
    React.useEffect(() => {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);
  
    const addTask = (task) => {
      setTasks((prevTasks) => [...prevTasks, task]);
    };
  
    const updateTask = (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    };
  
    const deleteTask = (id) => {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    };
  
    const toggleComplete = (id) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === id) {
            return { ...task, completed: !task.completed };
          }
          return task;
        })
      );
    };
  
    // Filter tasks based on search term, priority, and status
    const filteredTasks = tasks.filter((task) => {
      let match = true;
      if (searchTerm.trim() !== '') {
        match =
          match &&
          (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      if (filterPriority !== '') {
        match = match && task.priority === filterPriority;
      }
      if (filterStatus !== '') {
        if (filterStatus === 'pending') {
          match = match && !task.completed;
        } else if (filterStatus === 'completed') {
          match = match && task.completed;
        }
      }
      return match;
    });
  
    const today = new Date().setHours(0, 0, 0, 0);
  
    const upcomingTasks = filteredTasks.filter((task) => {
      if (task.completed) return false;
      const taskDueDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
      return taskDueDate >= today;
    });
  
    const overdueTasks = filteredTasks.filter((task) => {
      if (task.completed) return false;
      const taskDueDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
      return taskDueDate < today;
    });
  
    const completedTasks = filteredTasks.filter((task) => task.completed);
  
    return (
      <div className="container">
        <h1>Task Management App</h1>
        <TaskForm
          addTask={addTask}
          updateTask={updateTask}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
        />
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
        <Dashboard
          upcomingTasks={upcomingTasks}
          overdueTasks={overdueTasks}
          completedTasks={completedTasks}
          toggleComplete={toggleComplete}
          deleteTask={deleteTask}
          setEditingTask={setEditingTask}
        />
      </div>
    );
  }
  
  function TaskForm({ addTask, updateTask, editingTask, setEditingTask }) {
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [dueDate, setDueDate] = React.useState('');
    const [priority, setPriority] = React.useState('');
  
    React.useEffect(() => {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description);
        setDueDate(editingTask.dueDate);
        setPriority(editingTask.priority);
      } else {
        setTitle('');
        setDescription('');
        setDueDate('');
        setPriority('');
      }
    }, [editingTask]);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (
        title.trim() === '' ||
        description.trim() === '' ||
        dueDate.trim() === '' ||
        priority.trim() === ''
      ) {
        alert('Please fill in all fields');
        return;
      }
      const newTask = {
        id: editingTask ? editingTask.id : Date.now().toString(),
        title,
        description,
        dueDate,
        priority,
        completed: editingTask ? editingTask.completed : false,
      };
      if (editingTask) {
        updateTask(newTask);
        setEditingTask(null);
      } else {
        addTask(newTask);
      }
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('');
    };
  
    const handleCancel = () => {
      setEditingTask(null);
    };
  
    return (
      <div className="task-form">
        <h2>{editingTask ? 'Edit Task' : 'Add Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
            >
              <option value="">Select Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit">
              {editingTask ? 'Update Task' : 'Add Task'}
            </button>
            {editingTask && (
              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }
  
  function SearchAndFilter({
    searchTerm,
    setSearchTerm,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
  }) {
    return (
      <div className="search-filter">
        <h2>Search &amp; Filter</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="form-group inline">
          <label>Priority:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="form-group inline">
          <label>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
    );
  }
  
  function Dashboard({
    upcomingTasks,
    overdueTasks,
    completedTasks,
    toggleComplete,
    deleteTask,
    setEditingTask,
  }) {
    return (
      <div className="dashboard">
        <div className="task-section">
          <h2>Upcoming Tasks</h2>
          {upcomingTasks.length === 0 ? (
            <p>No upcoming tasks</p>
          ) : (
            upcomingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                toggleComplete={toggleComplete}
                deleteTask={deleteTask}
                setEditingTask={setEditingTask}
              />
            ))
          )}
        </div>
        <div className="task-section">
          <h2>Overdue Tasks</h2>
          {overdueTasks.length === 0 ? (
            <p>No overdue tasks</p>
          ) : (
            overdueTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                toggleComplete={toggleComplete}
                deleteTask={deleteTask}
                setEditingTask={setEditingTask}
              />
            ))
          )}
        </div>
        <div className="task-section">
          <h2>Completed Tasks</h2>
          {completedTasks.length === 0 ? (
            <p>No completed tasks</p>
          ) : (
            completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                toggleComplete={toggleComplete}
                deleteTask={deleteTask}
                setEditingTask={setEditingTask}
              />
            ))
          )}
        </div>
      </div>
    );
  }
  
  function TaskItem({ task, toggleComplete, deleteTask, setEditingTask }) {
    const dueDateFormatted = new Date(task.dueDate).toLocaleDateString();
    const isOverdue =
      !task.completed &&
      new Date(task.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
    return (
      <div
        className={`task-item ${task.completed ? 'completed' : ''} ${
          isOverdue ? 'overdue' : ''
        }`}
      >
        <h3>
          {task.title} <span className="priority">({task.priority})</span>
        </h3>
        <p>{task.description}</p>
        <p>
          <strong>Due:</strong> {dueDateFormatted}
        </p>
        <p>
          <strong>Status:</strong> {task.completed ? 'Completed' : 'Pending'}
        </p>
        <div className="task-actions">
          <button onClick={() => toggleComplete(task.id)}>
            {task.completed ? 'Mark as Pending' : 'Mark as Completed'}
          </button>
          <button onClick={() => setEditingTask(task)}>Edit</button>
          <button onClick={() => deleteTask(task.id)}>Delete</button>
        </div>
      </div>
    );
  }
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);