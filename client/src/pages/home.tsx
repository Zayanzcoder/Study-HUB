import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/ui/login-button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, User } from "lucide-react";

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
          <LoginButton />
        </nav>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-white mb-6">Your Personal Study Assistant</h2>
          <p className="text-xl text-gray-300 mb-8">Organize tasks, take notes, and get AI help - all in one place</p>
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
          className="text-white space-y-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">About StudyHub</h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              StudyHub is your all-in-one study companion, designed to help students stay organized
              and productive. With our powerful tools and AI assistance, we make studying more
              efficient and enjoyable.
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur-lg border-none text-white max-w-3xl mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold mb-4">Meet Our Founder</h3>
                <div className="flex items-start gap-6">
                  <img 
                    src="/attached_assets/1739543476017.jpg"
                    alt="Founder"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
                    style={{ objectPosition: 'center' }}
                  />
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      I am a high school student currently studying in 11th grade under the CBSE curriculum in Saudi Arabia. 
                      With a strong interest in technology and cybersecurity, I am preparing to pursue a Computer Science 
                      degree at RWTH Aachen University in Germany. My focus is on building a career in cybersecurity, and 
                      I am actively learning and developing skills in this field.
                    </p>
                    <p className="text-gray-300 mt-4">
                      This website is designed to provide students with valuable resources and support for their academic journey. 
                      My goal is to create a platform that simplifies learning and helps students achieve their academic goals efficiently.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <Mail className="h-4 w-4 text-gray-300" />
                      <a href="mailto:zayanzubair36@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                        zayanzubair36@gmail.com
                      </a>
                    </div>
                    <p className="text-gray-300 mt-4 font-light italic">
                      For any inquiries or collaborations, feel free to reach out.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}