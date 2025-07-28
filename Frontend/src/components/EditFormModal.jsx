import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const EditFormModal = ({ user, editForm, setEditForm }) => {
  const [formData, setFormData] = useState({
    username: user.username || "",
    fullname: user.fullname || "",
    email: user.email || "",
  });

  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setAvatar(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Update profile fields
      const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/users/update-data`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!profileRes.ok) {
        const error = await profileRes.json();
        throw new Error(error.message || "Failed to update profile");
      }

      // Update avatar if selected
      if (avatar) {
        const avatarData = new FormData();
        avatarData.append("avatar", avatar);

        const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/api/users/update-avatar`, {
          method: "PUT",
          credentials: "include",
          body: avatarData,
        });

        if (!avatarRes.ok) {
          const error = await avatarRes.json();
          throw new Error(error.message || "Failed to update avatar");
        }
      }

      setMessage("Profile updated successfully!");
      setTimeout(() => {
        setEditForm(false);
        window.location.reload(); // to reflect avatar update
      }, 1000);
    } catch (err) {
      setMessage(err.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {editForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-60 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 200,
              duration: 0.8,
            }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Edit Profile</h2>

            <div className="flex flex-col gap-4 mb-4 text-gray-800 dark:text-white">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="p-2 rounded border border-gray-300 focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Fullname"
                className="p-2 rounded border border-gray-300 focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="p-2 rounded border border-gray-300 focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleChange}
                className="text-sm text-gray-400 bg-gray-700 p-2 w-55 rounded-sm hover:cursor-pointer"
              />
            </div>

            {message && (
              <p className={`text-sm mb-2 ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>
                {message}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditForm(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm"
              >
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-yellow-300 to-amber-400 hover:from-yellow-400 hover:to-amber-500 text-black rounded-md shadow hover:shadow-violet-600/50 text-sm"
              >
                {loading ? "Saving..." : "Save"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditFormModal;
