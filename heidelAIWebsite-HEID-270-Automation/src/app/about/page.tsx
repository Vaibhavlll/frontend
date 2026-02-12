'use client';
import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 px-8">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-50/50 rounded-full blur-3xl translate-y-1/2 -z-10" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/heidelai.png"
              alt="HeidelAI Logo"
              width={120}
              height={120}
              className="rounded-lg mb-8 mx-auto"
            />
            <h1 className="text-3xl md:text-6xl font-bold mb-6 text-zinc-900">
              About HeidelAI
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 max-w-3xl mx-auto">
              Empowering businesses with cutting-edge AI solutions that transform customer communications and unlock data-driven insights.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="space-y-16">
          {/* Our Story */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-zinc-900 border-l-4 border-orange-500 pl-4">Our Story</h2>
            <div className="bg-gradient-to-br from-zinc-50/50 to-white border border-zinc-100/80 rounded-3xl p-8 prose prose-lg max-w-none shadow-xl shadow-zinc-200/50">
              <p className="text-sm md:text-lg text-zinc-600 leading-relaxed mb-4 text-justify">
                HeidelAI Limited was founded with a vision to bridge the gap between businesses and their customers through intelligent, AI-powered communication solutions. Based in the United Kingdom, we are a registered company (16116925) headquartered in Mildenhall, Bury St. Edmunds, England.
              </p>
              <p className="text-sm md:text-lg text-zinc-600 leading-relaxed text-justify">
                Our journey began with a simple observation: businesses were struggling to manage customer communications across multiple platforms while extracting meaningful insights from their data. We set out to create a unified solution that would not only streamline these processes but also leverage artificial intelligence to enhance customer experiences and drive business growth.
              </p>
            </div>
          </motion.section>

          {/* Our Mission */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-zinc-50 to-white border border-zinc-300/80 rounded-3xl p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] shadow-zinc-500/20"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-zinc-900 border-l-4 border-orange-500 pl-4">Our Mission</h2>
            <p className="text-sm md:text-lg text-zinc-600 text-lg leading-relaxed text-justify">
              To democratize AI-powered business intelligence and customer communication, making sophisticated technology accessible to businesses of all sizes. We believe that every interaction should be meaningful, every insight should be actionable, and every business should have the tools to thrive in the digital age.
            </p>
          </motion.section>

          {/* Our Products */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-zinc-900 border-l-4 border-orange-500 pl-4">Our Solutions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-zinc-50 to-white border border-zinc-300/80 rounded-2xl p-8 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-1">
                <h3 className="text-xl md:text-2xl font-semibold mb-4 text-zinc-900">Communicative</h3>
                <p className="text-sm md:text-base text-zinc-600 mb-4 text-justify">
                  A multi-platform, AI-powered chat solution that unifies customer communications across WhatsApp, Telegram, Facebook Messenger, Instagram, and web applications.
                </p>
                <ul className="space-y-2 text-xs md:text-base text-zinc-700">
                  <li>• Intelligent customer interactions</li>
                  <li>• Automated sales assistance</li>
                  <li>• 24/7 customer support</li>
                  <li>• Smart follow-up automation</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-zinc-50 to-white border border-zinc-300/80 rounded-2xl p-8 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-1">
                <h3 className="text-xl md:text-2xl font-semibold mb-4 text-zinc-900">Understandative</h3>
                <p className="text-sm md:text-base text-zinc-600 mb-4 text-justify">
                  An AI analytics platform that transforms raw data into actionable insights across website metrics, conversations, advertising, and social media.
                </p>
                <ul className="text-sm md:text-base text-zinc-600 mb-4 text-justify">
                  <li>• Real-time data processing</li>
                  <li>• Predictive analytics</li>
                  <li>• Performance optimization</li>
                  <li>• Actionable recommendations</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Our Values */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-zinc-50/50 to-white border border-zinc-100/50 rounded-3xl p-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-zinc-900 border-l-4 border-orange-500 pl-4">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white border border-zinc-100 shadow-[0_12px_24px_-6px_rgba(0,0,0,0.15)] shadow-zinc-300/60 transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src="/emojis/lock.png"
                    alt="Privacy Icon"
                    width={50}
                    height={50}
                  />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 text-zinc-900">Privacy First</h3>
                <p className="text-xs md:text-base text-zinc-600 text-justify px-4">
                  We maintain 100% data privacy for our clients. Your data belongs to you, and we never share it with third parties.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white border border-zinc-100 shadow-[0_12px_24px_-6px_rgba(0,0,0,0.15)] shadow-zinc-300/60 transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src="/emojis/rocket.png"
                    alt="Innovation Icon"
                    width={50}
                    height={50}
                  />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 text-zinc-900">Innovation</h3>
                <p className="text-xs md:text-base text-zinc-600 text-justify px-4">
                  We continuously push the boundaries of AI technology to deliver cutting-edge solutions that drive real business results.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white border border-zinc-100 shadow-[0_12px_24px_-6px_rgba(0,0,0,0.15)] shadow-zinc-300/60 transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src="/emojis/handshake.png"
                    alt="Partnership Icon"
                    width={50}
                    height={50}
                  />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 text-zinc-900">Partnership</h3>
                <p className="text-xs md:text-base text-zinc-600 text-justify px-4">
                  We build lasting relationships with our clients, working as partners to achieve their business objectives and growth goals.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Why Choose Us */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-zinc-50 to-white border border-zinc-300/80 rounded-3xl p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] shadow-zinc-500/20"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-zinc-900 border-l-4 border-orange-500 pl-4">Why Choose HeidelAI?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 text-zinc-900">Enterprise-Grade Security</h3>
                <p className="text-sm md:text-base text-zinc-600 mb-4 text-justify">
                  Built with compliance in mind, adhering to UK GDPR, Data Protection Act 2018, and international data protection standards.
                </p>

                <h3 className="text-lg md:text-xl font-semibold mb-3 text-zinc-900">Seamless Integration</h3>
                <p className="text-sm md:text-base text-zinc-600 text-justify">
                  Our solutions integrate effortlessly with your existing workflows and systems, minimizing disruption while maximizing value.
                </p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 text-zinc-900">24/7 Support</h3>
                <p className="text-sm md:text-base text-zinc-600 mb-4 text-justify">
                  Our dedicated support team is available around the clock to ensure your success with our platform.
                </p>

                <h3 className="text-lg md:text-xl font-semibold mb-3 text-zinc-900">Continuous Innovation</h3>
                <p className="text-sm md:text-base text-zinc-600 text-justify">
                  We regularly update our AI models and features based on the latest research and customer feedback.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Technology & AI */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-zinc-900 border-l-4 border-orange-500 pl-4">Our Technology</h2>
            <p className="text-sm md:text-lg text-zinc-600 text-lg leading-relaxed mb-6 text-justify">
              At the heart of HeidelAI lies sophisticated artificial intelligence powered by machine learning and natural language processing. Our AI systems are designed to understand context, predict customer behavior, and generate meaningful insights that drive business decisions.
            </p>
            <div className="bg-gradient-to-br from-zinc-50 to-white border border-zinc-300/80 rounded-2xl p-8 shadow-[0_48px_80px_-20px_rgba(0,0,0,0.25)] shadow-zinc-500/40">
              <h3 className="text-lg md:text-xl font-semibold mb-4 text-zinc-900">AI Capabilities</h3>
              <ul className="grid md:grid-cols-2 gap-4 text-zinc-600">
                <li className="flex items-center space-x-2 text-sm md:text-base">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span>Automated conversation management</span>
                </li>
                <li className="flex items-center space-x-2 text-sm md:text-base">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  <span>Intent and sentiment analysis</span>
                </li>
                <li className="flex items-center space-x-2 text-sm md:text-base">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span>Predictive customer insights</span>
                </li>
                <li className="flex items-center space-x-2 text-sm md:text-base">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span>Intelligent segmentation</span>
                </li>
                <li className="flex items-center space-x-2 text-sm md:text-base">
                  <span className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                  <span>Real-time recommendation engine</span>
                </li>
                <li className="flex items-center space-x-2 text-sm md:text-base">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  <span>Multi-language support</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Contact Section */}
          {/*  */}
        </div>
      </div>
    </div>
  );
}