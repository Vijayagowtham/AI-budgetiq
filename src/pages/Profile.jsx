import { User, Mail, Camera, Save, LogOut, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";

export function Profile() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: null
  });

  useEffect(() => {
    const userStr = localStorage.getItem("budgetiq_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const nameParts = user.full_name ? user.full_name.split(" ") : ["", ""];
        setFormData({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: user.email || "",
          avatar: user.avatar || null
        });
      } catch {
        console.error("Error parsing user data");
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Please choose a file under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 256;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX_DIM) { h *= MAX_DIM / w; w = MAX_DIM; } }
        else { if (h > MAX_DIM) { w *= MAX_DIM / h; h = MAX_DIM; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/webp", 0.65);
        setFormData(prev => ({ ...prev, avatar: compressed }));
        toast.info("Profile picture updated. Click 'Save Changes' to apply.");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    if (!formData.firstName.trim()) {
      toast.warning("First name is required.");
      return;
    }
    try {
      setLoading(true);
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const res = await api.put("/auth/profile", {
        email: formData.email,
        full_name: fullName,
        avatar: formData.avatar
      });
      localStorage.setItem("budgetiq_user", JSON.stringify(res.user));
      // Notify Navbar and Sidebar to re-read user from localStorage
      window.dispatchEvent(new Event('user-updated'));
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("budgetiq_token");
    localStorage.removeItem("budgetiq_user");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await api.delete("/auth/profile");
      localStorage.removeItem("budgetiq_token");
      localStorage.removeItem("budgetiq_user");
      navigate("/signup");
    } catch (err) {
      toast.error(err.message || "Failed to delete account");
      setLoading(false);
    }
  };

  const initials = formData.firstName
    ? (formData.firstName[0] + (formData.lastName?.[0] || "")).toUpperCase()
    : "U";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Profile Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account details and preferences.</p>
      </div>

      {/* Main profile card */}
      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change profile picture"
            >
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-slate-800/80 overflow-hidden transition-transform group-hover:scale-105 shadow-xl shadow-primary-500/20">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : initials}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm rounded-full">
                  <Camera size={26} className="text-white" />
                </div>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium focus:outline-none"
            >
              Change photo
            </button>
          </div>

          {/* Form fields */}
          <div className="flex-1 w-full space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">First Name</label>
                <Input icon={User} name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Last Name</label>
                <Input icon={User} name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <Input icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-slate-800">
              <Button onClick={handleUpdate} disabled={loading} className="sm:flex-1 group py-2.5">
                <Save size={17} className="mr-2 group-hover:scale-110 transition-transform" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="secondary" 
                className="w-full sm:w-auto px-6 py-2.5 hover:text-red-400 hover:border-red-500/30"
              >
                <LogOut size={17} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-500/15 bg-red-500/[0.03]">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Shield size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-50">Danger Zone</h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Once you delete your account, there is no going back. All of your budget history,
              transaction data, and AI insights will be permanently erased.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setDeleteConfirmOpen(true)}
          disabled={loading}
          variant="danger"
          className="text-red-400 hover:bg-red-500 hover:text-white"
        >
          Delete Account
        </Button>
      </Card>

      {/* Delete Account Confirm */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account Permanently"
        message="This will permanently delete your account, all income records, expense records, and cannot be undone. Are you absolutely certain?"
        confirmLabel="Yes, Delete My Account"
      />
    </div>
  );
}
