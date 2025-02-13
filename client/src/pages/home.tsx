import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LoginButton } from "@/components/ui/login-button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white"
          >
            StudyHub
          </motion.h1>
        </nav>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-white mb-6">Your Personal Study Assistant</h2>
          <p className="text-xl text-gray-300 mb-8">Organize tasks, take notes, and get AI help - all in one place</p>
          <LoginButton />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { title: "Task Management", description: "Organize and track your study tasks efficiently" },
            { title: "Smart Notes", description: "Take and share notes with collaborative features" },
            { title: "AI Chat Assistant", description: "Get instant help with your studies" }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white"
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">About Us</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            StudyHub is your all-in-one study companion, designed to help students stay organized
            and productive. With our powerful tools and AI assistance, we make studying more
            efficient and enjoyable.
          </p>
        </motion.div>
      </div>
    </div>
  );
}