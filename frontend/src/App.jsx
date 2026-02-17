import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const initialForm = {
  title: "",
  description: "",
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [workingTaskId, setWorkingTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(null);
  const [error, setError] = useState("");
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const completedCount = useMemo(
    () => safeTasks.filter((task) => task.completed).length,
    [safeTasks]
  );

  async function loadTasks() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/tasks");
      const nextTasks = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.value)
          ? response.data.value
          : [];
      setTasks(nextTasks);
      if (!Array.isArray(response.data) && !Array.isArray(response.data?.value)) {
        setError("Unexpected API response format. Expected a task list.");
      }
    } catch {
      setError("Could not load tasks. Check backend server and database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
      };

      const response = await api.post("/tasks", payload);
      setTasks((prev) => [response.data, ...(Array.isArray(prev) ? prev : [])]);
      setForm(initialForm);
    } catch {
      setError("Could not create task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(task) {
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
    });
    setError("");
  }

  function cancelEdit() {
    setEditingTaskId(null);
    setEditForm(initialForm);
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function updateTask(taskId, payload) {
    try {
      const response = await api.put(`/tasks/${taskId}`, payload);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? response.data : task)));
      return true;
    } catch {
      setError("Could not update task. Please try again.");
      return false;
    }
  }

  async function handleSaveEdit(task) {
    if (!editForm.title.trim()) {
      setError("Title is required.");
      return;
    }

    setWorkingTaskId(task.id);
    setError("");

    const didUpdate = await updateTask(task.id, {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      completed: Boolean(task.completed),
    });

    setWorkingTaskId(null);

    if (didUpdate) {
      cancelEdit();
    }
  }

  async function handleToggleComplete(task) {
    setWorkingTaskId(task.id);
    setError("");

    const toggledTask = { ...task, completed: !task.completed };
    setTasks((prev) => prev.map((item) => (item.id === task.id ? toggledTask : item)));

    try {
      const response = await api.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description || "",
        completed: !task.completed,
      });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? response.data : item)));
    } catch {
      setTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)));
      setError("Could not update task. Please try again.");
    }

    setWorkingTaskId(null);
  }

  function requestDelete(taskId) {
    const taskIndex = safeTasks.findIndex((task) => task.id === taskId);
    const taskToDelete = safeTasks[taskIndex];

    if (!taskToDelete) {
      return;
    }

    setConfirmDeleteTask({ task: taskToDelete, taskIndex });
  }

  function closeDeleteModal() {
    if (workingTaskId) {
      return;
    }
    setConfirmDeleteTask(null);
  }

  async function confirmDelete() {
    if (!confirmDeleteTask) {
      return;
    }

    const { task: taskToDelete, taskIndex } = confirmDeleteTask;
    const taskId = taskToDelete.id;

    setWorkingTaskId(taskId);
    setError("");
    setConfirmDeleteTask(null);

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (editingTaskId === taskId) {
      cancelEdit();
    }

    try {
      await api.delete(`/tasks/${taskId}`);
    } catch {
      setTasks((prev) => {
        const restored = [...prev];
        const insertAt = Math.min(taskIndex, restored.length);
        restored.splice(insertAt, 0, taskToDelete);
        return restored;
      });
      setError("Could not delete task. Please try again.");
    } finally {
      setWorkingTaskId(null);
    }
  }

  return (
    <main className="app-shell">
      <section className="panel hero">
        <p className="kicker">Task Manager</p>
        <h1>Ship your day in focused blocks.</h1>
        <p className="subtext">
          Create tasks, keep momentum, and track progress from one place.
        </p>

        <div className="stats">
          <article className="stat-card">
            <p className="stat-label">Total Tasks</p>
            <p className="stat-value">{safeTasks.length}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Completed</p>
            <p className="stat-value">{completedCount}</p>
          </article>
        </div>
      </section>

      <section className="panel form-panel">
        <h2>Create Task</h2>
        <form onSubmit={handleSubmit} className="task-form">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            placeholder="Plan sprint demo"
            maxLength={120}
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            placeholder="Outline agenda and share notes"
            rows={4}
            maxLength={400}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Task"}
          </button>
        </form>
      </section>

      <section className="panel list-panel">
        <div className="list-header">
          <h2>Task Inbox</h2>
          <button className="ghost-button" onClick={loadTasks} disabled={loading}>
            Refresh
          </button>
        </div>

        {error && <p className="message error">{error}</p>}
        {loading && <p className="message">Loading tasks...</p>}

        {!loading && !error && safeTasks.length === 0 && (
          <p className="message">No tasks yet. Add your first task above.</p>
        )}

        {!loading && !error && safeTasks.length > 0 && (
          <ul className="task-list">
            {safeTasks.map((task) => (
              <li key={task.id} className="task-item">
                {editingTaskId === task.id ? (
                  <div className="task-edit">
                    <input
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      maxLength={120}
                    />
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows={3}
                      maxLength={400}
                    />
                    <div className="task-actions">
                      <button
                        className="action-button"
                        onClick={() => handleSaveEdit(task)}
                        disabled={workingTaskId === task.id}
                      >
                        Save
                      </button>
                      <button className="ghost-button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3>{task.title}</h3>
                      <p>{task.description || "No description"}</p>
                      <div className="task-actions">
                        <button
                          className="action-button"
                          onClick={() => handleToggleComplete(task)}
                          disabled={workingTaskId === task.id}
                        >
                          {task.completed ? "Mark Open" : "Mark Done"}
                        </button>
                        <button
                          className="ghost-button"
                          onClick={() => startEdit(task)}
                          disabled={workingTaskId === task.id}
                        >
                          Edit
                        </button>
                        <button
                          className="ghost-button danger-button"
                          onClick={() => requestDelete(task.id)}
                          disabled={workingTaskId === task.id}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <span className={task.completed ? "badge done" : "badge pending"}>
                      {task.completed ? "Done" : "Open"}
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {confirmDeleteTask && (
        <div className="modal-backdrop" onClick={closeDeleteModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>Delete task?</h3>
            <p>
              This will permanently remove <strong>{confirmDeleteTask.task.title}</strong>.
            </p>
            <div className="task-actions">
              <button className="ghost-button" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button className="action-button danger-fill" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
