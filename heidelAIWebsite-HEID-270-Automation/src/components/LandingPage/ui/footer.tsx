"use client"
import { motion } from "framer-motion"
import { Mail, MapPin, Twitter, Linkedin, Instagram } from 'lucide-react';

// Footer data customized for Heidel AI
const footerData = {
  sections: [
    { title: "Product", links: ["Features", "Integrations", "Reviews", "Pricing"] },
    { title: "Company", links: ["About Us"] },
    { title: "Legal", links: ["Privacy Policy", "Terms of Service",] },
    { title: "Help", links: ["support@heidelai.com"] },
  ],
  social: [
    { href: "https://instagram.com/heidel_ai", label: "Instagram", icon: Instagram },
    { href: "https://x.com/heidel_ai", label: "Twitter", icon: Twitter },
    { href: "https://linkedin.com/company/heidel_ai", label: "LinkedIn", icon: Linkedin },
  ],
  title: "Heidel AI",
  subtitle: "AI-powered customer communication",
  copyright: "©2025 Heidel AI. All rights reserved",
  contact: {
    email: "hello@heidelai.com",
    location: "Mildenhall, United Kingdom"
  }
}

// Animation variants for reusability
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

const linkVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

const socialVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
    },
  },
}

const backgroundVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 2,
      ease: "easeOut",
    },
  },
}

// Helper function to determine link URL
const getLinkUrl = (link: string, sectionTitle: string) => {
  // Product section - use hash links for same page sections
  if (sectionTitle === "Product") {
    switch (link) {
      case "Features": return "#features"
      case "Integrations": return "#integrations"
      case "Reviews": return "#testimonials"
      case "Pricing": return "#pricing"
      default: return `#${link.toLowerCase().replace(/\s+/g, '-')}`
    }
  }

  // Company section - use page routes
  if (sectionTitle === "Company") {
    switch (link) {
      case "About Us": return "/about"
      case "Contact": return "/contact"
      default: return `/${link.toLowerCase().replace(/\s+/g, '-')}`
    }
  }

  // Legal section - use page routes
  if (sectionTitle === "Legal") {
    switch (link) {
      case "Privacy Policy": return "/privacy-policy"
      case "Terms of Service": return "/terms-of-service"
      case "Cookie Policy": return "/cookie-policy"
      case "GDPR": return "/gdpr"
      case "Security": return "/security"
      default: return `/${link.toLowerCase().replace(/\s+/g, '-')}`
    }
  }

  // Help section - handle email links
  if (sectionTitle === "Help") {
    if (link.includes("@")) {
      return `mailto:${link}`
    }
    return `/${link.toLowerCase().replace(/\s+/g, '-')}`
  }

  // Default fallback
  return `#${link.toLowerCase().replace(/\s+/g, '-')}`
}

// Helper function to check if link is external
const isExternalLink = (url: string) => {
  return url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('/')
}



// Reusable components
const NavSection = ({ title, links, index }: { title: string; links: string[]; index: number }) => (
  <motion.div variants={itemVariants} custom={index} className="flex flex-col gap-2">
    <motion.h3
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
      className="mb-2 uppercase text-gray-500 text-xs font-semibold tracking-wider border-b border-gray-200 pb-1 hover:text-gray-900 transition-colors duration-300"
    >
      {title}
    </motion.h3>
    {links.map((link, linkIndex) => {
      const linkUrl = getLinkUrl(link, title)
      const isExternal = isExternalLink(linkUrl)

      return (
        <motion.a
          key={linkIndex}
          variants={linkVariants}
          custom={linkIndex}
          href={linkUrl}
          {...(isExternal && linkUrl.startsWith('http') ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          whileHover={{
            x: 8,
            transition: { type: "spring", stiffness: 300, damping: 20 },
          }}
          className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-sans text-xs md:text-sm group relative"
        >
          <span className="relative">
            {link}
            <motion.span
              className="absolute bottom-0 left-0 h-0.5 bg-blue-600"
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </span>
        </motion.a>
      )
    })}
  </motion.div>
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SocialLink = ({ href, label, icon: Icon, index }: { href: string; label: string; icon: any; index: number }) => (
  <motion.a
    variants={socialVariants}
    custom={index}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{
      scale: 1.2,
      rotate: 12,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    }}
    whileTap={{ scale: 0.9 }}
    className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-300 group"
    aria-label={label}
  >
    <Icon className="w-3 h-3 md:w-4 md:h-4 text-gray-600 group-hover:text-white transition-colors duration-300" />
  </motion.a>
)

export default function StickyFooter() {
  return (
    <div className="relative h-[80vh] sm:h-[70vh]" style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}>
      <div className="relative h-[calc(100vh+80vh)] sm:h-[calc(100vh+70vh)] -top-[100vh]">
        <div className="h-[80vh] sm:h-[70vh] sticky top-[calc(100vh-80vh)] sm:top-[calc(100vh-70vh)]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="bg-white py-6 md:py-12 px-4 md:px-12 h-full w-full flex flex-col justify-between relative overflow-hidden text-gray-900"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50/40 via-transparent to-gray-50/20 pointer-events-none" />

            <motion.div
              variants={backgroundVariants}
              className="absolute top-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-blue-50 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            <motion.div
              variants={backgroundVariants}
              className="absolute bottom-0 left-0 w-48 h-48 md:w-96 md:h-96 bg-purple-50 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            />

            {/* Navigation Section */}
            <motion.div variants={containerVariants} className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-20">
                {footerData.sections.map((section, index) => (
                  <NavSection key={section.title} title={section.title} links={section.links} index={index} />
                ))}
              </div>
            </motion.div>

            {/* Footer Bottom Section */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
              className="flex flex-col md:flex-row justify-between items-start md:items-end relative z-10 gap-4 md:gap-6 mt-6"
            >
              <div className="flex-1">
                {/* Logo */}
                <motion.img
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0, duration: 0.6, ease: "easeOut" }}
                  whileHover={{
                    scale: 1.1,
                    transition: { type: "spring", stiffness: 300, damping: 20 },
                  }}
                  src="/heidelai.png"
                  alt="Heidel AI Logo"
                  className="w-16 h-16 md:w-24 md:h-24 object-contain sm:mb-3 cursor-pointer"
                />

                <motion.h1
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                  className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 cursor-default mb-4"
                >
                  {footerData.title}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mb-4"
                >
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-gray-600 text-xs md:text-sm font-sans hover:text-gray-900 transition-colors duration-300"
                  >
                    {footerData.subtitle}
                  </motion.p>
                </motion.div>

                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                  className="space-y-2"
                >
                  <div className="flex items-center text-gray-600 text-xs md:text-sm">
                    <Mail className="w-3 h-3 md:w-4 md:h-4 mr-2 flex-shrink-0" />
                    <span>{footerData.contact.email}</span>
                  </div>
                  <div className="flex items-start text-gray-600 text-xs md:text-sm">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{footerData.contact.location}</span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="text-left md:text-right"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 hover:text-gray-900 transition-colors duration-300"
                >
                  {footerData.copyright}
                </motion.p>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 2, staggerChildren: 0.1 }}
                  className="flex gap-2 md:gap-3"
                >
                  {footerData.social.map((social, index) => (
                    <SocialLink
                      key={social.label}
                      href={social.href}
                      label={social.label}
                      icon={social.icon}
                      index={index}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}