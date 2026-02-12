import { Card, CardContent, CardHeader } from '@/components/LandingPage/ui/card'
import { 
  Bot, 
  MessageCircle, 
  BarChart3, 
  Users, 
  ShoppingCart, 
  Zap,
  Brain,
  HeadphonesIcon
} from 'lucide-react'
import Image from 'next/image'

export function FeaturesBento() {
    return (
        <section id="features" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-blue-600 font-semibold text-lg mb-2 block">FEATURES</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Packed with <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">thousands</span> of features
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        From AI-powered chatbots to intelligent lead targeting, our platform provides solutions for everything your business needs to thrive.
                    </p>
                </div>

                <div className="mx-auto max-w-6xl">
                    <div className="mx-auto grid gap-2 sm:grid-cols-5">
                        {/* AI Conversation Summary - Large Card */}
                        <Card className="group overflow-hidden shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-tl-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                                <div className="md:p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Bot className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-xl text-gray-900">AI Conversation Summary</p>
                                            <p className="text-gray-600 mt-2 max-w-sm text-sm">Get intelligent summaries of customer conversations, saving you from reading entire chat histories.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <div className="relative h-fit pl-6 md:pl-12">
                                <div className="absolute -inset-6 [background:radial-gradient(75%_95%_at_50%_0%,transparent,hsl(var(--background))_100%)]"></div>
                                <div className="bg-background overflow-hidden rounded-tl-lg border-l border-t pl-2 pt-2 dark:bg-zinc-950">
                                    <Image
                                        src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                                        className="w-full h-auto object-cover rounded-tl-lg"
                                        alt="AI conversation summary illustration"
                                        width={800}
                                        height={600}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Smart Reply Suggestions - Tall Card */}
                        <Card className="group overflow-hidden shadow-zinc-950/5 sm:col-span-2 sm:rounded-none sm:rounded-tr-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <MessageCircle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-xl text-gray-900">Smart Reply Suggestions</h3>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-6 text-sm leading-relaxed">AI-powered reply suggestions help you respond to customers faster and more effectively.</p>
                            </div>

                            <CardContent className="mt-auto h-fit">
                                <div className="relative mb-6 sm:mb-0">
                                    <div className="absolute -inset-6 [background:radial-gradient(50%_75%_at_75%_50%,transparent,hsl(var(--background))_100%)]"></div>
                                    <div className="aspect-[4/3] overflow-hidden rounded-r-lg border">
                                        <Image
                                            src="https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                                            className="w-full h-full object-cover"
                                            alt="Smart reply suggestions illustration"
                                            width={800}
                                            height={600}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Multi-Agent Support - Square Card */}
                        <Card className="group p-6 shadow-black/5 sm:col-span-2 sm:rounded-none sm:rounded-bl-xl md:p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-xl bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-xl text-gray-900">Multi-Agent Support</h3>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-8 text-sm leading-relaxed">Enable your customer support team with multiple agents working seamlessly together.</p>

                            <div className="flex justify-center gap-6">
                                <div className="relative flex aspect-square size-16 items-center rounded-lg border bg-gray-50 p-3 shadow-sm ring-1 ring-gray-100">
                                    <span className="absolute right-2 top-1 block text-xs text-gray-500">AI</span>
                                    <Bot className="mt-auto size-4 text-gray-600" />
                                </div>
                                <div className="flex aspect-square size-16 items-center justify-center rounded-lg border bg-gray-50 p-3 shadow-sm ring-1 ring-gray-100">
                                    <Users className="size-4 text-gray-600" />
                                </div>
                                <div className="flex aspect-square size-16 items-center justify-center rounded-lg border bg-gray-50 p-3 shadow-sm ring-1 ring-gray-100">
                                    <HeadphonesIcon className="size-4 text-gray-600" />
                                </div>
                            </div>
                        </Card>

                        {/* Product Catalog & More Features - Wide Card */}
                        <Card className="group relative shadow-black/5 sm:col-span-3 sm:rounded-none sm:rounded-br-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                            <CardHeader className="p-6 md:p-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <ShoppingCart className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-xl text-gray-900">Product Catalog Sync</p>
                                        <p className="text-gray-600 mt-2 max-w-sm text-sm">Automatically sync your website products to WhatsApp Business Catalog and other platforms.</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative h-fit px-6 pb-6 md:px-8 md:pb-8">
                                <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
                                    <div className="rounded-lg aspect-square border border-dashed border-gray-300"></div>
                                    <div className="rounded-lg bg-orange-100 flex aspect-square items-center justify-center border p-3">
                                        <BarChart3 className="size-6 text-orange-600" />
                                    </div>
                                    <div className="rounded-lg aspect-square border border-dashed border-gray-300"></div>
                                    <div className="rounded-lg bg-pink-100 flex aspect-square items-center justify-center border p-3">
                                        <Zap className="size-6 text-pink-600" />
                                    </div>
                                    <div className="rounded-lg aspect-square border border-dashed border-gray-300"></div>
                                    <div className="rounded-lg bg-indigo-100 flex aspect-square items-center justify-center border p-3">
                                        <Brain className="size-6 text-indigo-600" />
                                    </div>
                                </div>
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-orange-600 font-semibold">Lead Analysis</div>
                                        <div className="text-gray-500 text-xs mt-1">Smart lead detection</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-pink-600 font-semibold">Product Messaging</div>
                                        <div className="text-gray-500 text-xs mt-1">Rich product previews</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-indigo-600 font-semibold">AI Recommendations</div>
                                        <div className="text-gray-500 text-xs mt-1">Intelligent suggestions</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}