import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore.js";
import { Eye, EyeOff, Plane, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage = () => {
  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const validateLogin = () => {
    if (!formData.username.trim()) return toast.error("Username is required");
    if (!formData.password.trim()) return toast.error("Password is required");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = validateLogin();

    if (success === true) {
      setIsFlying(true);
      
      // Delay actual auth request slightly to allow the flight takeoff animation to smoothly play
      const minAnimationTime = new Promise((resolve) => setTimeout(resolve, 1400));
      
      try {
        await Promise.all([login(formData), minAnimationTime]);
        navigate("/dashboard");
      } catch (error) {
        setIsFlying(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const showOverlay = isFlying || isLoggingIn;

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans bg-black relative">
      {/* Full screen smooth transition overlay when logging in */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-center items-center pointer-events-auto"
          >
            <div className="relative flex flex-col items-center">
              {/* Flying Plane Takeoff Animation */}
              <motion.div
                initial={{ x: -160, y: 80, scale: 0.7, opacity: 0, rotate: 15 }}
                animate={{ 
                  x: [ -160, 0, 160 ], 
                  y: [ 80, -20, -120 ],
                  scale: [ 0.7, 1.2, 1.5 ],
                  opacity: [ 0, 1, 0 ],
                  rotate: [ 15, 28, 40 ]
                }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="text-white drop-shadow-[0_0_20px_rgba(111,181,255,0.9)]"
              >
                <Plane size={64} className="fill-white/30 stroke-white" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white font-semibold text-xl tracking-wider mt-8"
              >
                Navigating to Dashboard...
              </motion.p>
              
              <div className="w-56 h-1.5 bg-gray-800 rounded-full mt-4 overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full bg-gradient-to-r from-[#6FB5FF] via-[#FFC79C] to-[#C39EF2]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Section - Original Black Theme with Subtle Floating Animations */}
      <div className="w-full md:w-4/6 flex flex-col justify-center px-8 md:px-16 py-12 md:py-0 items-center bg-black relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-xl"
        >
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white text-3xl md:text-4xl font-semibold mb-1"
          >
            Get started with
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ 
              opacity: { duration: 0.7, delay: 0.3 },
              scale: { duration: 0.7, delay: 0.3 },
              backgroundPosition: { duration: 6, repeat: Infinity, ease: "linear" }
            }}
            style={{ backgroundSize: "200% 200%" }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#6FB5FF] via-[#FFC79C] to-[#C39EF2] text-transparent bg-clip-text leading-tight py-1 mb-3"
          >
            {import.meta.env.VITE_APP_NAME || "Aswaq Forwarder"}
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-300 text-base md:text-lg leading-relaxed"
          >
            Simplify shipping, organize efficiently, and <br className="hidden sm:inline" /> stay connected
          </motion.p>
        </motion.div>

        {/* Decorative Animated Circles from Original Design */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute md:left-[-100px] md:bottom-[-180px] w-[400px] h-[400px] border border-gray-700/60 rounded-full pointer-events-none"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.08, 1],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute md:left-[-50px] md:bottom-[-200px] w-[400px] h-[400px] border border-gray-600/50 rounded-full pointer-events-none"
        />
      </div>

      {/* Right Section - Original White Form Layout with Smooth Animations & Precise Alignment */}
      <div className="w-full md:w-2/6 flex flex-col justify-center items-center bg-white px-6 md:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <h2 className="text-gray-900 text-2xl md:text-3xl font-bold mb-1">
            Hello!
          </h2>
          <p className="text-gray-600 mb-8 font-medium">Sign in to Get Started</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label className="text-gray-700 text-sm font-semibold mb-2">Admin ID</label>
              <input
                type="text"
                placeholder="Admin ID"
                className="w-full px-3 py-2.5 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 text-sm font-semibold mb-2">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-3 py-2.5 pr-10 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-2 text-gray-500 hover:text-gray-900 transition-colors p-1 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center items-center bg-black px-4 py-3.5 text-white font-semibold rounded-none mt-6 hover:bg-gray-800 transition cursor-pointer shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={showOverlay}
            >
              {showOverlay ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Logging in...</span>
                </div>
              ) : (
                "LOGIN"
              )}
            </motion.button>

            <p className="text-sm text-center text-gray-600 mt-6">
              Forgot Password ?{" "}
              <a className="font-semibold text-black underline hover:text-gray-800 transition-colors" href="/contact">
                Contact us
              </a>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;


