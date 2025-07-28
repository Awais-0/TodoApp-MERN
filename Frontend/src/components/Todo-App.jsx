import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import EditFormModal from "./EditFormModal";
import bgImage from '../assets/bg3.jpg'

const TodoApp = () => {
  const [items, setItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [formData, setFormData] = useState({ title: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndTodos = async () => {
      try {
        const authRes = await fetch("http://localhost:4000/api/users/check-auth", {
          credentials: "include",
        });

        if (!authRes.ok) return navigate("/");

        const userRes = await fetch("http://localhost:4000/api/users/get-current-user", {
          credentials: "include",
        });

        if (userRes.ok) {
          const result = await userRes.json();
          setCurrentUser(result.data);
          await fetchTodos();
        } else {
          console.error("Failed to fetch current user");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/");
      }
    };

    fetchUserAndTodos();
  }, [navigate]);

  const fetchTodos = async () => {
    try {
      const todosResponse = await fetch("http://localhost:4000/api/users/get-user-todos", {
        credentials: "include",
      });

      if (todosResponse.ok) {
        const result = await todosResponse.json();
        setItems(result.data || []);
      } else {
        console.error("Todos not found");
      }
    } catch (error) {
      console.error("Todo fetching failed", error);
    }
  };

  const addItem = async () => {
    if (!formData.title.trim()) return;

    try {
      const response = await fetch("http://localhost:4000/api/users/add-todo", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setFormData({ title: "" });
          await fetchTodos();
        }
      }
    } catch (error) {
      console.error("Failed to add todo", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const removeItem = async (id) => {
  try {
    const response = await fetch(`http://localhost:4000/api/users/delete-todo/${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      // Immediately update the UI without relying only on fetchTodos
      setItems((prevItems) => prevItems.filter((item) => item._id !== id));
    } else {
      console.error("Failed to delete todo");
    }
  } catch (error) {
    console.error("Error while deleting todo", error);
  }
};


  const toggleIsComplete = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/toggle-isCompleteTodo/${id}`, {
        method: "PATCH",
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        const updatedTodo = result.data;
        setItems((prevItems) =>
          prevItems.map((item) =>
            item._id === updatedTodo._id ? { ...item, isCompleted: updatedTodo.isCompleted } : item
          )
        );
      }
    } catch (error) {
      console.error("Error toggling todo completion", error);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/users/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) navigate("/");
      else console.error("Logout failed");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex w-screen min-h-screen bg-gradient-to-r from-amber-400 to-yellow-200 text-amber-950 font-semibold p-3 items-center justify-center bg-center bg-cover" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="relative flex flex-col w-[80vh] h-[90vh] bg-black/50 rounded-2xl items-center justify-start shadow-xl shadow-blue-500/40 hover:shadow-blue-500/80 hover:shadow-2xl transition duration-300 p-6 gap-4 backdrop-blur-sm">
        {/* Header */}
        <div className="flex w-full justify-between items-center mb-7 mt-5 relative">
          <h1 className="text-3xl font-bold text-white">📝 To-Do List</h1>
          {currentUser?.avatar && (
            <div className="relative">
              <img
                onClick={() => setShowDropdown((prev) => !prev)}
                src={currentUser.avatar}
                alt="User Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-600 hover:cursor-pointer"
              />
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-14 z-10 bg-white shadow-lg rounded-lg w-64 border border-gray-200 p-4 text-left"
                  >
                    <p className="font-semibold text-blue-800">{currentUser.fullname}</p>
                    <p className="text-sm text-gray-700">@{currentUser.username}</p>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                    <FiEdit
                      className="text-gray-600 hover:text-blue-600 transition-colors mt-3 hover:cursor-pointer"
                      onClick={() => setEditForm(true)}
                    />
                    <hr className="my-3" />
                    <button
                      onClick={logout}
                      className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="flex w-full gap-3">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a new task..."
            className="bg-gray-100 w-full p-2 outline-none rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={addItem}
            className="w-auto p-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
          >
            Add
          </button>
        </div>

        {/* To-Do List */}
        <div className="flex-1 w-full overflow-y-auto mt-2 pr-1">
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item._id}
                className="flex items-center justify-between bg-gray-100 p-3 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600"
                    onChange={() => toggleIsComplete(item._id)}
                    checked={item.isCompleted}
                  />
                  <p
                    className="break-words w-full"
                    style={{ textDecoration: item.isCompleted ? "line-through" : "none" }}
                  >
                    {item.title}
                  </p>
                </div>
                <MdDelete
                  onClick={() => removeItem(item._id)}
                  className="text-red-600 size-5 hover:text-red-800 transition-colors hover:cursor-pointer hover:size-6 flex-shrink-0"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {editForm && (
        <EditFormModal user={currentUser} editForm={editForm} setEditForm={setEditForm} />
      )}
    </div>
  );
};

export default TodoApp;
