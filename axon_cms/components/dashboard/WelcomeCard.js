import React from "react";
import { motion } from "framer-motion";

export default function WelcomeCard({ userData }) {
  const name = userData?.name || userData?.username;
  const role = userData?.role_headless?.name || userData?.role?.name;
  const organization = userData?.organization?.name;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8"
    >
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {name ? `${greeting}, ${name}` : greeting}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {organization
            ? `Working in ${organization}`
            : "Your CMS overview"}
          {role ? ` · ${role}` : ""}
        </p>
      </div>
    </motion.div>
  );
}
