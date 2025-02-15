import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/ui/login-button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, User, Brain, Sparkles, BookOpen, Clock } from "lucide-react";

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
          <h2 className="text-5xl font-bold text-white mb-6">Your AI-Powered Study Assistant</h2>
          <p className="text-xl text-gray-300 mb-8">Transform your learning with intelligent task management, smart notes, and personalized AI guidance</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { 
              title: "Smart Task Management",
              description: "AI-optimized task organization that adapts to your study patterns",
              icon: Brain
            },
            { 
              title: "Intelligent Notes",
              description: "Take and share notes with AI-powered insights and suggestions",
              icon: Sparkles
            },
            { 
              title: "Study AI Assistant",
              description: "Get personalized study recommendations and instant help with your subjects",
              icon: BookOpen
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <feature.icon className="h-6 w-6" />
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
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
              StudyHub combines the power of AI with intuitive study tools to create a seamless learning experience. 
              Our AI-driven platform adapts to your learning style, offering personalized recommendations, 
              smart task organization, and intelligent study insights to help you achieve your academic goals.
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur-lg border-none text-white max-w-3xl mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold mb-4">Meet Our Founder</h3>
                <div className="flex items-start gap-6">
                  <img 
                    src="1739543476017.jpg"
                    alt="Founder"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
                  />
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      Hi, I'm Zayan—the person behind StudyHub. I created this platform to empower students 
                      with a smart, AI-driven assistant that streamlines daily tasks, note-taking, and 
                      personalized recommendations. As someone who's experienced the challenges of juggling 
                      academic life, I built StudyHub to help you focus more on learning and less on managing 
                      the chaos. Here, every feature is designed with your needs in mind, making your journey 
                      through school smoother and more efficient. Thanks for being a part of this community, 
                      and I look forward to growing and learning alongside you.
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