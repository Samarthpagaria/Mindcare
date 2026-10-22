import React from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { MoveRight } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  MessageCircle,
  Flower2,
  Users,
  UserCheck,
  Brain,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react";
import imagee from "../assets/imageTwoo.png";
import hero from "../assets/hero.jpg";

export function HomePage({ setCurrentPage }) {
  const features = [
    {
      icon: MessageCircle,
      title: "24/7 AI Support",
      description:
        "Get instant support from our AI companion, available anytime you need to talk.",
      action: () => setCurrentPage("chat"),
      color: "bg-blue-500",
    },
    {
      icon: Flower2,
      title: "Relaxation Hub",
      description:
        "Access guided meditations, breathing exercises, and wellness tools.",
      action: () => setCurrentPage("relaxation"),
      color: "bg-green-500",
    },
    {
      icon: Users,
      title: "Peer Support",
      description:
        "Connect with others who understand your journey in a safe community.",
      action: () => setCurrentPage("peer"),
      color: "bg-purple-500",
    },
    {
      icon: UserCheck,
      title: "Professional Help",
      description:
        "Find and book sessions with licensed mental health professionals.",
      action: () => setCurrentPage("counselors"),
      color: "bg-orange-500",
    },
  ];

  const stats = [
    { number: "24/7", label: "AI Support Available" },
    { number: "500+", label: "Licensed Counselors" },
    { number: "10k+", label: "Community Members" },
    { number: "95%", label: "User Satisfaction" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 relative z-10"
            >
              <Link to={"/relaxation"} className="space-y-4">
                <Badge className="group mb-4 px-4 py-2 text-sm bg-blue-100 text-blue-800 font-semibold rounded-full border border-blue-200 flex items-center gap-3 cursor-pointer overflow-hidden">
                  {/* Ripple Dot */}
                  <span className="relative flex h-3 w-3">
                    {/* Center dot */}
                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-900"></span>

                    {/* Ripple waves */}
                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-900 opacity-75 animate-ping"></span>
                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-900 opacity-50 animate-ping [animation-delay:0.4s]"></span>
                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-900 opacity-25 animate-ping [animation-delay:0.8s]"></span>
                  </span>

                  {/* Badge text */}
                  <span className="whitespace-nowrap">
                    Your Mental Wellness Journey Starts Here
                  </span>

                  {/* Right Icon (hidden until hover) */}
                  <MoveRight
                    className="ml-2 text-blue-900 w-6 h-6 opacity-0 translate-x-[-10px] transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-x-0"
                    strokeWidth={3}
                  />
                </Badge>

                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900">
                  <span className="block">Your Mind</span>
                  <span className="block bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                    Matters
                  </span>
                </h1>

                <p className=" text-xl text-gray-500 max-w-xl ">
                  Comprehensive mental health support with AI assistance,
                  professional counseling, peer connections, and wellness tools
                  all in one safe space.
                </p>
              </Link>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Start AI Chat Button */}
                <Button
                  size="lg"
                  onClick={() => setCurrentPage("chat")}
                  className="relative z-20 rounded-3xl px-6 py-3 text-white font-semibold overflow-hidden group"
                >
                  {/* Default solid dark blue background */}
                  <span className="absolute inset-0 bg-blue-800 rounded-3xl"></span>

                  {/* Shimmer gradient overlay on hover */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-3xl"
                    style={{
                      background:
                        "linear-gradient(90deg, #1e40af 0%, #cc8c61ff 50%, #1e40af 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 5s linear infinite",
                    }}
                  ></span>

                  {/* Button content */}
                  <span className="relative flex items-center justify-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Start AI Chat</span>
                  </span>

                  {/* Inline keyframes */}
                  <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
                </Button>

                {/* Book a Session */}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setCurrentPage("counselors")}
                  className="bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100 rounded-3xl px-6 py-3 font-semibold"
                >
                  Book a Session
                </Button>
              </div>
            </motion.div>

            {/* Right: Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center items-center relative"
            >
              {/* Animated background blobs */}
              <motion.div
                initial={{ opacity: 0.7, scale: 1, x: -60, y: -60 }}
                animate={{ opacity: 0.7, scale: 1.2, x: -40, y: -40 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 3,
                }}
                className="absolute left-0 top-0 w-64 h-64 bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 rounded-full blur-3xl z-0"
              />
              <motion.div
                initial={{ opacity: 0.6, scale: 1, x: 60, y: 60 }}
                animate={{ opacity: 0.6, scale: 1.1, x: 40, y: 40 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1,
                }}
                className="absolute right-0 bottom-0 w-72 h-72 bg-gradient-to-tr from-pink-400 via-blue-200 to-blue-400 rounded-full blur-3xl z-0"
              />

              {/* Foreground Image */}
              <div className="relative flex items-center justify-center mx-auto z-10">
                <ImageWithFallback
                  src={imagee}
                  alt="Peaceful meditation"
                  className="object-cover w-[500px] h-[420px] transition-transform duration-300 rounded-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides multiple pathways to support
              your mental health journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="h-full hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={feature.action}
                  >
                    <CardHeader className="text-center">
                      <div
                        className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center mb-4">
                        {feature.description}
                      </CardDescription>
                      <Button
                        variant="ghost"
                        className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                      >
                        Learn More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold text-gray-900">
                Your Privacy & Safety First
              </h2>
              <p className="text-lg text-gray-600">
                We understand that seeking mental health support requires trust.
                Our platform is built with security, privacy, and your wellbeing
                at the core.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold">End-to-End Encryption</h3>
                    <p className="text-gray-600">
                      All conversations are encrypted and secure.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Brain className="h-6 w-6 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-semibold">Evidence-Based Tools</h3>
                    <p className="text-gray-600">
                      Clinically validated assessments and techniques.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-purple-500 mt-1" />
                  <div>
                    <h3 className="font-semibold">24/7 Availability</h3>
                    <p className="text-gray-600">
                      Support when you need it most.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={hero}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative flex items-center justify-center h-[200px] overflow-hidden">
        {/* Branding Text with vertical gradient */}
        <h1 className="text-[8rem] md:text-[14rem] font-extrabold uppercase text-transparent bg-clip-text bg-gradient-to-b from-purple-500 via-blue-300 to-transparent">
          MindCare
        </h1>
      </section>
      <footer className="py-4 text-center text-sm text-white-500 border-t border-gray-200 bg-blue-900/70">
        © {new Date().getFullYear()} MindCare. All rights reserved.
      </footer>
    </div>
  );
}
