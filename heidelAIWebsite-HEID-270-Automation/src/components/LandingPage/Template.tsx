import { Badge } from '@/components/LandingPage/ui/badge';
import { Button } from '@/components/LandingPage/ui/button';
import { Card, CardContent } from '@/components/LandingPage/ui/card';
import { BarChart3, CloudIcon, ShoppingBag } from 'lucide-react';
import React from 'react';

export default function Template() {
  // Data for the lead analysis card
  const leadTags = [
    {
      text: "Potential Lead",
      className: "rotate-[-10.42deg] bg-[#626ab536] border-none",
      dotColor: "",
      showDot: false,
    },
    {
      text: "High Priority",
      className:
        "rotate-[63.87deg] bg-[#626ab52e] border border-solid border-[#ffffff0d]",
      dotColor: "bg-[#ff6666]",
      showDot: true,
    },
    {
      text: "Window Shopper",
      className:
        "rotate-[-90.00deg] bg-[#626ab536] border border-solid border-[#ffffff0d]",
      dotColor: "bg-[#66bfff]",
      showDot: true,
    },
    {
      text: "Medium",
      className:
        "rotate-[-54.55deg] bg-[#626ab536] border border-solid border-[#ffffff0d]",
      dotColor: "bg-[#fbc983]",
      showDot: true,
    },
  ];

  // Data for feature cards
  const featureCards = [
    {
      title: "AI Recommendations",
      description: "Smartly recommends products to boost sales",
      className: "top-8 left-8 h-[396px]",
      content: (
        <div className="relative w-[173px] h-[206px] bg-[#626ab51f] rounded-[13px] border-none">
          <div className="relative w-[312px] h-[330px] top-[-126px] left-[-151px]">
            <div className="absolute w-[296px] h-[330px] top-0 left-0">
              <img
                src=""
                alt="iPhone"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute w-11 h-11 top-[273px] left-[268px] rounded-[10000px] border border-solid border-[#ffffff26] -rotate-180 [background:radial-gradient(50%_50%_at_95%_50%,rgba(165,244,210,1)_0%,rgba(51,214,119,1)_100%),linear-gradient(0deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.05)_100%)]">
              <ShoppingBag className="absolute w-[21px] h-[21px] top-3 left-[11px] rotate-180" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Lead Analysis",
      description: "Automatically scan and tag potential leads",
      className: "top-[456px] left-[906px] h-[412px]",
      content: (
        <div className="relative w-[206px] h-[261.75px] ml-[-4.00px] mr-[-4.00px] overflow-hidden">
          <div className="relative w-[217px] h-[272px] -top-0.5 left-[-9px]">
            {leadTags.map((tag, index) => (
              <div
                key={`tag-${index}`}
                className={`inline-flex h-12 items-center justify-center gap-3 p-5 absolute ${index === 0 ? "top-[13px] left-16" : index === 1 ? "top-[54px] -left-5" : index === 2 ? "top-[71px] left-24" : "top-[111px] left-[51px]"} rounded-full ${tag.className}`}
              >
                <div className="inline-flex items-center gap-[7px] relative flex-[0_0_auto] mt-[-2.00px] mb-[-2.00px]">
                  {tag.showDot && (
                    <div
                      className={`relative w-2.5 h-2.5 ${tag.dotColor} rounded-[5px]`}
                    />
                  )}
                  <div className="relative w-fit mt-[-1.00px] font-medium text-[#d4ccff] text-base tracking-[0] leading-[34px] whitespace-nowrap">
                    {tag.text}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex w-14 h-14 items-center justify-center gap-3.5 p-3.5 absolute top-12 left-[97px] rounded-[11802.8px] border border-solid border-[#ffffff3b] rotate-[30.00deg] [background:radial-gradient(50%_50%_at_70%_49%,rgba(255,218,163,1)_0%,rgba(226,127,90,1)_47%,rgba(105,22,22,1)_100%)]">
              <div className="relative w-[32.78px] h-[32.78px] mt-[-2.39px] mb-[-2.39px] ml-[-2.39px] mr-[-2.39px] rotate-[-30.00deg]">
                <BarChart3 className="w-full h-full" />
              </div>
            </div>
            <div className="flex w-14 h-14 items-center justify-center gap-1.5 p-3 absolute top-[102px] left-2.5 rounded-[10000px] border border-solid border-[#ffffff26] rotate-[150.00deg] [background:radial-gradient(50%_50%_at_95%_50%,rgba(187,165,244,1)_0%,rgba(95,51,214,1)_100%),linear-gradient(0deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.05)_100%)]">
              <div className="relative w-6 h-6 rotate-[-180.00deg]">
                <Badge
                  className="absolute w-[33px] h-[33px] -top-1 left-[-5px] rotate-[30.00deg]"
                  variant="outline"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white border-[40px] border-solid border-transparent w-[1200px] h-[900px] relative">
        {/* AI Recommendations Card */}
        <Card className="absolute w-[262px] h-[396px] top-8 left-8 bg-[#1d1d3b] rounded-3xl border border-solid border-[#ffffff0d]">
          <CardContent className="flex flex-col w-full h-full items-center gap-[38px] p-8 rounded-[var(--tailwindcss-radius-3xl)] border border-solid border-[#ffffff0d] [background:radial-gradient(50%_50%_at_84%_44%,rgba(127,139,210,0.3)_0%,rgba(89,106,197,0)_100%),linear-gradient(0deg,rgba(25,25,52,1)_0%,rgba(25,25,52,1)_100%)]">
            <div className="flex flex-col items-start gap-1 relative self-stretch w-full flex-[0_0_auto]">
              <h3 className="self-stretch mt-[-1.00px] font-bold text-[#e6e3ff] text-lg leading-7 relative tracking-[0]">
                AI Recommendations
              </h3>
              <p className="relative self-stretch font-normal text-[#ac9fe4] text-base tracking-[0] leading-6">
                Smartly recommends products to boost sales
              </p>
            </div>
            <div className="relative w-[173px] h-[206px] bg-[#626ab51f] rounded-[13px] border-none">
              <div className="relative w-[312px] h-[330px] top-[-126px] left-[-151px]">
                <img
                  className="absolute w-[296px] h-[330px] top-0 left-0"
                  alt="iPhone"
                  src=""
                />
                <div className="absolute w-11 h-11 top-[273px] left-[268px] rounded-[10000px] border border-solid border-[#ffffff26] -rotate-180 [background:radial-gradient(50%_50%_at_95%_50%,rgba(165,244,210,1)_0%,rgba(51,214,119,1)_100%),linear-gradient(0deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.05)_100%)]">
                  <ShoppingBag className="absolute w-[21px] h-[21px] top-3 left-[11px] rotate-180" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Card */}
        <Card className="flex flex-col w-[262px] h-[219px] items-center justify-center gap-6 absolute top-[456px] left-8 bg-[#1d1d3b] rounded-3xl border border-solid border-[#ffffff0d]">
          <CardContent className="flex flex-col w-[262px] h-[220px] items-center justify-center gap-5 pt-[34px] pb-[30px] px-8 relative mt-[-0.50px] mb-[-0.50px] rounded-[var(--tailwindcss-radius-3xl)] border border-solid border-[#ffffff0d] [background:radial-gradient(50%_50%_at_87%_54%,rgba(127,139,210,0.3)_0%,rgba(89,106,197,0)_100%),linear-gradient(0deg,rgba(25,25,52,1)_0%,rgba(25,25,52,1)_100%)]">
            <div className="inline-flex items-center px-0 py-px relative flex-[0_0_auto]">
              <div className="ml-[-3.00px] rounded-[var(--tailwindcss-radius-full)] border-[3px] border-solid border-[#15172c] bg-[linear-gradient(0deg,rgba(229,140,93,1)_0%,rgba(229,140,93,1)_100%)] relative w-[62px] h-[62px] mt-[-3.00px] mb-[-3.00px]" />
              <div className="-ml-3 relative w-[62px] h-[62px] mt-[-3.00px] mb-[-3.00px] rounded-full bg-[#1d1d3b]" />
              <div className="mr-[-3.00px] -ml-3 rounded-[var(--tailwindcss-radius-full)] border-[3px] border-solid border-[#15172c] bg-[linear-gradient(0deg,rgba(138,108,234,1)_0%,rgba(138,108,234,1)_100%)] relative w-[62px] h-[62px] mt-[-3.00px] mb-[-3.00px]" />
            </div>
            <div className="flex flex-col items-center gap-3 self-stretch w-full relative flex-[0_0_auto]">
              <p className="relative w-fit mt-[-1.00px] font-normal text-[#b1a0fc] text-lg text-center tracking-[0] leading-7 whitespace-nowrap">
                Better with a
              </p>
              <h2 className="relative self-stretch bg-[linear-gradient(101deg,rgba(255,178,102,1)_0%,rgba(233,118,111,1)_49%,rgba(192,67,80,1)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] font-semibold text-transparent text-[62px] text-center tracking-[-1.24px] leading-[56px]">
                Team
              </h2>
            </div>
            <img
              className="absolute w-[262px] h-[220px] top-0 left-0 bg-blend-overlay"
              alt="Rectangle"
              src=""
            />
          </CardContent>
        </Card>

        {/* Sync Products Card */}
        <Card className="flex flex-col w-[262px] h-[165px] items-center justify-center absolute top-[703px] left-8 bg-[#1d1d3b] rounded-3xl border border-solid border-[#ffffff0d]">
          <CardContent className="flex flex-col w-[262px] h-[153px] items-center justify-center px-[23px] py-8 relative rounded-[var(--tailwindcss-radius-3xl)] border border-solid border-[#ffffff0d] [background:radial-gradient(50%_50%_at_88%_49%,rgba(127,139,210,0.3)_0%,rgba(89,106,197,0)_100%),linear-gradient(0deg,rgba(25,25,52,1)_0%,rgba(25,25,52,1)_100%)]">
            <div className="flex h-[72px] self-stretch w-full bg-[#10092b40] rounded-[10000px] shadow-[inset_0px_1px_3px_#01041d80,0px_1px_1px_#ffffff12] items-center gap-1 p-2 relative overflow-hidden">
              <Button className="flex items-center justify-center gap-1.5 pl-[15px] pr-3 py-3 relative flex-1 self-stretch grow rounded-[10000px] border border-solid border-[#ffffff26] shadow-shadow-lg [background:radial-gradient(50%_50%_at_95%_50%,rgba(187,165,244,1)_0%,rgba(95,51,214,1)_100%),linear-gradient(0deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.05)_100%)] h-auto">
                <CloudIcon className="relative w-8 h-8 ml-[-5.50px]" />
                <span className="relative w-[146px] mr-[-5.50px] font-medium text-white text-xl tracking-[0] leading-7">
                  Sync Products
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Central Content Area */}
        <div className="absolute w-[556px] h-[836px] top-8 left-[322px]">
          <div className="absolute w-[270px] h-[270px] top-[283px] left-[143px] bg-[#1d1d3b] rounded-[135px] border border-solid border-[#ffffff0d]" />
          <div className="absolute w-[270px] h-[270px] top-[283px] left-[143px] rotate-[18.37deg]">
            <div className="relative w-[566px] h-[566px] top-[-148px] left-[-148px]">
              <img
                className="absolute w-[448px] h-[448px] top-[59px] left-[59px] rotate-[-18.37deg] object-cover"
                alt="Sphere"
                src=""
              />
              <img
                className="absolute w-[341px] h-[341px] top-28 left-28 rotate-[-18.37deg] object-cover"
                alt="Sphere"
                src=""
              />
            </div>
          </div>

          <div className="flex flex-col w-[556px] h-[396px] items-start gap-1 absolute top-0 left-0 rounded-3xl">
            <div className="flex flex-col w-[556px] h-[396px] items-center gap-8 relative rounded-3xl">
              <div className="absolute w-full h-full top-0 left-0 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl" />
              <div className="absolute w-[378px] h-[167px] top-[229px] left-[89px] bg-[#ffffff10] rounded-full blur-md" />
              <div className="relative w-[452px] flex-[0_0_auto] mt-12 text-center">
                <p className="text-white text-xl mb-2 font-medium">HeidelAI</p>
                <h2 className="text-white text-5xl font-bold leading-tight">
                  Your AI Sales &<br />
                  Support Engine
                </h2>
              </div>
            </div>
          </div>

          <div className="absolute w-[368px] h-[368px] top-[234px] left-[94px]">
            <div className="relative h-[368px]">
              <div className="absolute w-[352px] h-[145px] top-1 left-2 bg-[url(/CODE.svg)] bg-[100%_100%]" />
              <div className="absolute w-[368px] h-[368px] top-0 left-0 bg-[url(/CODE-2.svg)] bg-[100%_100%]" />
            </div>
          </div>

          {/* Left Feature Card */}
          <Card className="flex flex-col w-[264px] h-[412px] items-start gap-1 absolute top-[424px] left-0 rounded-3xl bg-[#1d1d3b] border border-solid border-[#ffffff0d]">
            <CardContent className="flex flex-col w-[264px] h-[412px] items-start justify-end gap-1 px-8 py-7 relative rounded-3xl overflow-hidden">
              <div className="absolute w-full h-full top-0 left-0 bg-gradient-to-br from-[#1d1d3b] to-[#2a2a5c]" />
              <div className="absolute w-[98px] h-[166px] top-0 left-0 bg-[#ffffff08] rounded-br-full" />
              <div className="absolute w-[175px] h-[183px] top-0 left-[89px] bg-[#ffffff05] rounded-bl-full" />
              <div className="w-[232px] ml-[-32.00px] relative flex-[0_0_auto] mt-auto">
                <h3 className="text-white text-xl font-medium mb-2">
                  Smart Replies
                </h3>
                <p className="text-[#ac9fe4] text-base">
                  AI reply suggestions for faster support
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right Feature Card */}
          <Card className="flex flex-col w-[264px] h-[412px] items-start gap-1 absolute top-[424px] left-[292px] rounded-3xl bg-[#1d1d3b] border border-solid border-[#ffffff0d]">
            <CardContent className="flex flex-col w-[264px] h-[412px] items-start justify-end gap-1 px-8 py-7 relative rounded-3xl overflow-hidden">
              <div className="absolute w-full h-full top-0 left-0 bg-gradient-to-br from-[#1d1d3b] to-[#2a2a5c]" />
              <div className="absolute w-[175px] h-[183px] top-0 left-0 bg-[#ffffff05] rounded-br-full" />
              <div className="absolute w-[100px] h-[168px] top-0 left-[164px] bg-[#ffffff08] rounded-bl-full" />
              <div className="self-stretch w-full ml-[-32.00px] relative flex-[0_0_auto] mt-auto">
                <h3 className="text-white text-xl font-medium mb-2">
                  Chat Insights
                </h3>
                <p className="text-[#ac9fe4] text-base">
                  Intelligent chat summaries that save you time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Badge Card */}
        <Card className="flex flex-col w-[262px] h-[158px] items-center justify-center absolute top-8 left-[906px] bg-[#1d1d3b] rounded-3xl border border-solid border-[#ffffff0d]">
          <CardContent className="flex flex-col w-[262px] h-[157px] items-center justify-center gap-8 relative rounded-[var(--tailwindcss-radius-3xl)] border border-solid border-[#ffffff0d] [background:radial-gradient(50%_50%_at_78%_50%,rgba(127,139,210,0.3)_0%,rgba(89,106,197,0)_100%),linear-gradient(0deg,rgba(25,25,52,1)_0%,rgba(25,25,52,1)_100%)]">
            <div className="inline-flex flex-[0_0_auto] bg-[#00000026] rounded-[11802px] border border-solid border-[#5b4b8973] shadow-[inset_0px_0px_23.61px_#0000004c] items-center gap-1 p-2 relative overflow-hidden">
              <div className="flex w-14 h-14 items-center justify-center gap-3.5 p-3.5 relative rounded-[11802.8px] border border-solid border-[#ffffff3b] shadow-[0px_0px_26px_-5px_#00000033] [background:radial-gradient(50%_50%_at_71%_47%,rgba(255,218,163,1)_0%,rgba(226,127,90,1)_47%,rgba(105,22,22,1)_100%)]">
                <div className="w-[34px] h-[17px] ml-[-3.00px] mr-[-3.00px] font-normal text-white text-[17px] leading-[normal] whitespace-nowrap relative tracking-[0]">
                  AI
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 25% Increase Card */}
        <Card className="flex flex-col w-[262px] h-[210px] items-center justify-center gap-6 absolute top-[218px] left-[906px] bg-[#1d1d3b] rounded-3xl border border-solid border-[#ffffff0d]">
          <CardContent className="flex flex-col w-[262px] h-[211px] items-center justify-center gap-6 pt-[34px] pb-8 px-8 relative mt-[-0.50px] mb-[-0.50px] rounded-[var(--tailwindcss-radius-3xl)] border border-solid border-[#ffffff0d] [background:radial-gradient(50%_50%_at_79%_53%,rgba(127,139,210,0.3)_0%,rgba(89,106,197,0)_100%),linear-gradient(0deg,rgba(25,25,52,1)_0%,rgba(25,25,52,1)_100%)]">
            <div className="relative w-fit bg-[linear-gradient(90deg,rgba(245,241,255,1)_0%,rgba(102,51,238,1)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] font-semibold text-transparent text-[62px] text-center tracking-[-1.24px] leading-[56px] whitespace-nowrap">
              25%
            </div>
            <div className="relative w-[196px] h-10">
              <div className="relative w-[198px] h-10">
                <div className="w-[188px] h-10 left-[5px] bg-[linear-gradient(90deg,rgba(178,148,255,0.1)_0%,rgba(79,43,172,0.2)_100%)] absolute top-0" />
                <div className="left-0 absolute w-2.5 h-10 top-0 bg-gradient-to-r from-[#b294ff] to-[#b294ff] rounded-l-md" />
                <div className="left-[188px] absolute w-2.5 h-10 top-0 bg-gradient-to-r from-[#4f2bac] to-[#4f2bac] rounded-r-md" />
                <div className="absolute h-[13px] top-3 left-[29px] font-normal text-[#b1a0fc] text-lg text-center tracking-[0] leading-7 whitespace-nowrap">
                  increase in sales
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Analysis Card */}
        <Card className="absolute w-[262px] h-[412px] top-[456px] left-[906px] bg-[#1d1d3b] rounded-3xl border border-solid border-[#ffffff0d]">
          <CardContent className="flex flex-col w-[262px] h-[412px] items-center justify-between pt-7 pb-6 px-8 relative rounded-[var(--tailwindcss-radius-3xl)] border border-solid border-[#ffffff0d] [background:radial-gradient(50%_50%_at_84%_44%,rgba(127,139,210,0.3)_0%,rgba(89,106,197,0)_100%),linear-gradient(0deg,rgba(25,25,52,1)_0%,rgba(25,25,52,1)_100%)]">
            <div className="flex flex-col items-start gap-1 self-stretch w-full relative flex-[0_0_auto]">
              <h3 className="relative w-fit mt-[-1.00px] font-bold text-[#e6e3ff] text-lg tracking-[0] leading-7 whitespace-nowrap">
                Lead Analysis
              </h3>
              <p className="relative self-stretch font-normal text-[#ac9fe4] text-base tracking-[0] leading-6">
                Automatically scan and tag potential leads
              </p>
            </div>
            <div className="relative w-[206px] h-[261.75px] ml-[-4.00px] mr-[-4.00px] overflow-hidden">
              <div className="relative w-[217px] h-[272px] -top-0.5 left-[-9px]">
                {leadTags.map((tag, index) => (
                  <div
                    key={`tag-${index}`}
                    className={`inline-flex h-12 items-center justify-center gap-3 p-5 absolute ${index === 0 ? "top-[13px] left-16" : index === 1 ? "top-[54px] -left-5" : index === 2 ? "top-[71px] left-24" : "top-[111px] left-[51px]"} rounded-full ${tag.className}`}
                  >
                    <div className="inline-flex items-center gap-[7px] relative flex-[0_0_auto] mt-[-2.00px] mb-[-2.00px]">
                      {tag.showDot && (
                        <div
                          className={`relative w-2.5 h-2.5 ${tag.dotColor} rounded-[5px]`}
                        />
                      )}
                      <div className="relative w-fit mt-[-1.00px] font-medium text-[#d4ccff] text-base tracking-[0] leading-[34px] whitespace-nowrap">
                        {tag.text}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex w-14 h-14 items-center justify-center gap-3.5 p-3.5 absolute top-12 left-[97px] rounded-[11802.8px] border border-solid border-[#ffffff3b] rotate-[30.00deg] [background:radial-gradient(50%_50%_at_70%_49%,rgba(255,218,163,1)_0%,rgba(226,127,90,1)_47%,rgba(105,22,22,1)_100%)]">
                  <div className="relative w-[32.78px] h-[32.78px] mt-[-2.39px] mb-[-2.39px] ml-[-2.39px] mr-[-2.39px] rotate-[-30.00deg]">
                    <BarChart3 className="w-full h-full" />
                  </div>
                </div>
                <div className="flex w-14 h-14 items-center justify-center gap-1.5 p-3 absolute top-[102px] left-2.5 rounded-[10000px] border border-solid border-[#ffffff26] rotate-[150.00deg] [background:radial-gradient(50%_50%_at_95%_50%,rgba(187,165,244,1)_0%,rgba(95,51,214,1)_100%),linear-gradient(0deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.05)_100%)]">
                  <div className="relative w-6 h-6 rotate-[-180.00deg]">
                    <Badge
                      className="absolute w-[33px] h-[33px] -top-1 left-[-5px] rotate-[30.00deg]"
                      variant="outline"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
