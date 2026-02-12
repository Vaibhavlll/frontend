"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconTextScan2,
  IconListSearch,
  IconToggleRightFilled,
  IconTemplate,
  IconTag,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { AnimateInView } from "./AnimateInView";

export function BentoGridThirdDemo() {
  return (
    <>
      <div id="features" className=" my-20">
        <AnimateInView>
          <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto px-4 text-center tracking-tight font-medium text-white">

            Packed with <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent thousands">thousands</span> of features
          </h4>

          <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-center font-normal text-neutral-300">
            From AI-Chatbot to Insightful Ads Targeting, Heidel AI has solutions for
            literally everything. It can help you identify leads and convert them more quickly.
          </p>
        </AnimateInView>
      </div>
      <AnimateInView delay={0.2}>
        <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              className={cn("[&>p:text-lg]", item.className)}
              icon={item.icon}
            />
          ))}
        </BentoGrid>
      </AnimateInView>
    </>
  );
}

const SkeletonOne = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[7rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >

      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border  border-white/[0.2] p-2 items-center space-x-2 w-3/4 ml-auto bg-black"
      >
        <div className="w-full  h-4 rounded-full bg-neutral-900" />
        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
      </motion.div>
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-white/[0.2] p-2 items-center w-3/4 space-x-2 bg-black"
      >
        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
        <div className="w-full  h-4 rounded-full bg-neutral-900" />
      </motion.div>
      <div className="flex flex-row bg-red">
        <div className="w-16 h-20 border mx-1.5 rounded p-1.5 border-white/[0.2]">
          <div className="bg-neutral-900 w-full h-9 rounded-sm"></div>
          <span className="text-neutral-500 text-[0.5rem] absolute mt-1 ml-0.5">$12.4</span>
        </div>
        <div className="w-16 h-20 border mx-1.5 rounded p-1.5 border-white/[0.2]">
          <div className="bg-neutral-900 w-full h-9 rounded-sm"></div>
          <span className="text-neutral-500 text-[0.5rem] absolute mt-1 ml-0.5">$12.4</span>
        </div>
        <div className="w-16 h-20 border mx-1.5 rounded p-1.5 border-white/[0.2]">
          <div className="bg-neutral-900 w-full h-9 rounded-sm"></div>
          <span className="text-neutral-500 text-[0.5rem] absolute mt-1 ml-0.5">$12.4</span>

        </div>
      </div>
    </motion.div>
  );
};
const SkeletonTwo = () => {
  //   const variants = {
  //     initial: {
  //       width: 0,
  //     },
  //     animate: {
  //       width: "100%",
  //       transition: {
  //         duration: 0.2,
  //       },
  //     },
  //     hover: {
  //       width: ["0%", "100%"],
  //       transition: {
  //         duration: 2,
  //       },
  //     },
  //   };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] bg-dot-white/[0.2] items-end justify-center flex-col space-y-2"
    >
      <div className="flex flex-col justify-start items-end w-full h-full border rounded border-white/[0.1] p-4 bg-black">
        <div className="flex items-center">
          <span className="AI mx-1.5">AI</span>
          <div className=" mx-1.5 h-8 w-14 flex items-center justify-end rounded-full p-2 bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" >
            <div className="w-5 h-5 rounded-full bg-white"> </div>
          </div>
        </div>
        <div className="w-full  border-t my-4 border-white/[0.2]"></div>
        <div className="w-48 h-4 bg-neutral-900 rounded-full my-1"></div>
        <div className="w-36 h-4 bg-neutral-900 rounded-full my-1"></div>
        <div className="w-40 h-4 bg-neutral-900 rounded-full my-1"></div>
      </div>
    </motion.div>
  );
};
const SkeletonThree = () => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="flex w-full h-full min-h-[6rem] bg-dot-white/[0.2] rounded flex-col justify-center items-center"
      style={{
        background:
          "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
      }}
    >
      <div className="w-full h-auto flex items-center justify-center">
        <Image
          src="/features/whatsapp.svg"
          alt="avatar"
          height="100"
          width="100"
          className="rounded-full h-10 w-10" />
        <span className="templates text-xl">Templates</span>
      </div>
    </motion.div>
  );
};
const SkeletonFour = () => {
  const first = {
    initial: {
      x: 20,
      rotate: -5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  const second = {
    initial: {
      x: -20,
      rotate: 5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] bg-dot-white/[0.2]  flex-row space-x-2"
    >
      <motion.div
        variants={first}
        className="h-full w-1/3 rounded-2xl  p-4 bg-black border-white/[0.2] border  flex flex-col items-center justify-center"
      >
        <Image
          src="/features/facebook.png"
          alt="avatar"
          height="100"
          width="100"
          className="rounded-full h-10 w-10"
        />
        <p className="sm:text-sm text-xs text-center font-semibold text-neutral-400 mt-4">
          Bob Smith
        </p>
        <p className="border border-yellow-500  bg-red-900/20 text-yellow-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Medium
        </p>
      </motion.div>
      <motion.div className="h-full relative z-20 w-1/3 rounded-2xl  p-4 bg-black border-white/[0.2] border  flex flex-col items-center justify-center">
        <Image
          src="/features/whatsapp.png"
          alt="avatar"
          height="100"
          width="100"
          className="rounded-full h-10 w-10"
        />
        <p className="sm:text-sm text-xs text-center font-semibold text-neutral-400 mt-4">
          John Doe
        </p>
        <p className="border border-red-500 bg-green-900/20 text-red-600 text-xs rounded-full px-2 py-0.5 mt-4">
          High
        </p>
      </motion.div>
      <motion.div
        variants={second}
        className="h-full w-1/3 rounded-2xl  p-4 bg-black border-white/[0.2] border  flex flex-col items-center justify-center"
      >
        <Image
          src="/features/instagram.png"
          alt="avatar"
          height="100"
          width="100"
          className="rounded-full h-10 w-10"
        />
        <p className="sm:text-sm text-xs text-center font-semibold text-neutral-400 mt-4">
          Alice Johnson
        </p>
        <p className="border border-green-500 bg-orange-900/20 text-green-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Low
        </p>
      </motion.div>
    </motion.div>
  );
};
const SkeletonFive = () => {
  //   const variants = {
  //     initial: {
  //       x: 0,
  //     },
  //     animate: {
  //       x: 10,
  //       rotate: 5,
  //       transition: {
  //         duration: 0.2,
  //       },
  //     },
  //   };
  //   const variantsSecond = {
  //     initial: {
  //       x: 0,
  //     },
  //     animate: {
  //       x: -10,
  //       rotate: -5,
  //       transition: {
  //         duration: 0.2,
  //       },
  //     },
  //   };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] bg-dot-white/[0.2]  flex-col "
    >
      <span className="AI2 p-2">AI Summary</span>
      <div className="w-full border-t-2 my-4 border-white/[0.2]"></div>
      <div className="w-48 h-4 bg-neutral-900 rounded-full my-1"></div>
      <div className="w-36 h-4 bg-neutral-900 rounded-full my-1"></div>
      <div className="w-40 h-4 bg-neutral-900 rounded-full my-1"></div>
    </motion.div>
  );
};
const items = [
  {
    title: "AI Based Recommendations",
    description: (
      <span className="text-sm">
        Chatbot recommends products from your website, driving sales.
      </span>
    ),
    header: <SkeletonOne />,
    className: "md:col-span-1",
    icon: <IconListSearch className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Human Agent Support",
    description: (
      <span className="text-sm">
        Seamlessly switch between AI and human agents with a single click.
      </span>
    ),
    header: <SkeletonTwo />,
    className: "md:col-span-1",
    icon: <IconToggleRightFilled className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Message Templates",
    description: (
      <span className="text-sm">
        Create, manage & send templates from one place.
      </span>
    ),
    header: <SkeletonThree />,
    className: "md:col-span-1",
    icon: <IconTemplate className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Lead Analysis",
    description: (
      <span className="text-sm">
        Automatically scans and tags potential leads by buying intent.
      </span>
    ),
    header: <SkeletonFour />,
    className: "md:col-span-2",
    icon: <IconTag className="h-4 w-4 text-neutral-500" />,
  },

  {
    title: "Conversation Insights",
    description: (
      <span className="text-sm">
        AI summarizes key insights, saving you from reading the chat history.
      </span>
    ),
    header: <SkeletonFive />,
    className: "md:col-span-1",
    icon: <IconTextScan2 className="h-4 w-4 text-neutral-500" />,
  },
];



