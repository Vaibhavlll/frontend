"use client";
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/LandingPage/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ScheduleDemo } from '@/components/LandingPage/ui/schedule-demo';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

const menuItems = [
	{ name: 'Features', href: '#features' },
	{ name: 'Reviews', href: '#CustomerStories' },
	{ name: 'Integrations', href: '#integrations' },
	{ name: 'Pricing', href: '#pricing' },
];

const Header = () => {
	const [menuState, setMenuState] = React.useState(false);
	const [isScrolled, setIsScrolled] = React.useState(false);
	const [currentSection, setCurrentSection] = React.useState('hero');
	const login = usePathname() === '/login';

	React.useEffect(() => {
		// Add smooth scroll behavior to html element
		document.documentElement.style.scrollBehavior = 'smooth';

		const handleScroll = () => {
			const scrollY = window.scrollY;
			setIsScrolled(scrollY > 50);

			// Define section boundaries - cast to HTMLElement
			const heroSection = document.getElementById('home') as HTMLElement;
			const featuresSection = document.getElementById('features') as HTMLElement;
			const integrationsSection = document.getElementById('integrations') as HTMLElement;
			const testimonialsSection = document.getElementById('CustomerStories') as HTMLElement;
			const pricingSection = document.getElementById('pricing') as HTMLElement;
			const ctaSection = document.querySelector('[data-section="cta"]') as HTMLElement;

			// Calculate section positions
			const heroHeight = heroSection?.offsetHeight || 0;
			const featuresTop = featuresSection?.offsetTop || 0;
			const integrationsTop = integrationsSection?.offsetTop || 0;
			const testimonialsTop = testimonialsSection?.offsetTop || 0;
			const pricingTop = pricingSection?.offsetTop || 0;
			const ctaTop = ctaSection?.offsetTop || 0;

			// Determine current section with buffer zones
			const buffer = 100;

			if (scrollY < heroHeight - buffer) {
				setCurrentSection('hero');
			} else if (scrollY >= featuresTop - buffer && scrollY < integrationsTop - buffer) {
				setCurrentSection('features');
			} else if (scrollY >= integrationsTop - buffer && scrollY < testimonialsTop - buffer) {
				setCurrentSection('integrations');
			} else if (scrollY >= testimonialsTop - buffer && scrollY < pricingTop - buffer) {
				setCurrentSection('CustomerStories');
			} else if (scrollY >= pricingTop - buffer && scrollY < ctaTop - buffer) {
				setCurrentSection('pricing');
			} else if (scrollY >= ctaTop - buffer) {
				setCurrentSection('cta');
			} else {
				setCurrentSection('light');
			}
		};

		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Initial call

		return () => {
			window.removeEventListener('scroll', handleScroll);
			// Reset scroll behavior when component unmounts
			document.documentElement.style.scrollBehavior = 'auto';
		};
	}, []);

	// Handle smooth scroll navigation
	const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
		e.preventDefault();
		const targetElement = document.querySelector(href);
		if (targetElement) {
			targetElement.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		}
		// Close mobile menu after clicking
		setMenuState(false);
	};

	// Determine if we should use dark theme
	const isDarkTheme = !login && currentSection === 'cta';


	//   const [isOpen, setIsOpen] = React.useState(false);


	//   const [userName, setUserName] = useState('');
	//   const [userEmail, setUserEmail] = useState('');
	//   const [userPhone, setUserPhone] = useState('');
	//   const [companyName, setCompanyName] = useState('');

	//   const handleDemoRequest = async (e: React.FormEvent) => {
	// 	e.preventDefault();

	// 	// Basic validation checks
	// 	if (!userName.trim() || !userEmail.trim() || !userPhone.trim() || !companyName.trim()) {
	// 	  sonnerToast.error('Please fill all the details.');
	// 	  return;
	// 	}

	// 	// Email validation
	// 	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	// 	if (!emailRegex.test(userEmail.trim())) {
	// 	  sonnerToast.error('Please enter a valid email address.');
	// 	  return;
	// 	}

	// 	// Phone number validation (basic check for digits and common formats)
	// 	const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
	// 	const cleanedPhone = userPhone.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses

	// 	if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 8) {
	// 	  sonnerToast.error('Please enter a valid phone number (minimum 8 digits).');
	// 	  return;
	// 	}

	// 	// Create form data to match Google Form's expected format
	// 	const formData = new FormData();
	// 	formData.append('entry.545040562', userName.trim());       // Name
	// 	formData.append('entry.1231199003', userEmail.trim());     // Email
	// 	formData.append('entry.1154213412', cleanedPhone);         // Phone (cleaned)
	// 	formData.append('entry.1081121699', companyName.trim());   // Company

	// 	try {
	// 	  await fetch("https://docs.google.com/forms/d/e/1FAIpQLSdB_mtDsubutUM_y1draxzdbfzcsqcIz9Ok_hTwPayBukJPNg/formResponse", {
	// 		method: 'POST',
	// 		mode: 'no-cors',  // Required to bypass CORS errors
	// 		body: formData,
	// 	  });

	// 	  sonnerToast.success('Request received! We will contact you shortly.');

	// 	  // Clear the form after successful submission
	// 	  setUserName('');
	// 	  setUserEmail('');
	// 	  setUserPhone('');
	// 	  setCompanyName('');

	// 	  // Close the drawer after successful submission
	// 	  setIsOpen(false);
	// 	} catch (error) {
	// 	  sonnerToast.error('Failed to submit the form. Please try again.');
	// 	  console.error('Error:', error);
	// 	}
	//   };

	const router = useRouter();
	//   const [messages, setMessages] = useState<Message[]>([]);
	//   const [input, setInput] = useState('');
	//   const [isLoading, setIsLoading] = useState(false);
	//   const [visitorName, setVisitorName] = useState<string | null>(null);
	//   const [visitorCompany, setVisitorCompany] = useState<string | null>(null);
	//   const [sessionId, setSessionId] = useState<string | null>(null);
	//   const [isInitializing, setIsInitializing] = useState(true);
	//   const scrollAreaRef = useRef<HTMLDivElement>(null);
	//   const { toast } = useToast();

	//   useEffect(() => {
	// 	const initializeChat = async () => {
	// 		const newSessionId = uuidv4();
	// 		setSessionId(newSessionId);
	// 		setSessionId(newSessionId);

	// 		// Send initial greeting message
	// 		const initialMessage: Message = {
	// 		  role: 'assistant',
	// 		  content: "Hello! I'm HeidelAI's AI Assistant. Before we begin, could you please tell me your name and the company you're representing?"
	// 		};

	// 		setMessages([initialMessage]);
	// 		await storeMessage(initialMessage, null, null, newSessionId);
	// 		setIsInitializing(false);
	// 	  }

	// 	initializeChat();
	//   }, []);

	//   useEffect(() => {
	// 	if (scrollAreaRef.current) {
	// 	  scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
	// 	}
	//   }, [messages]);

	//   const handleSubmit = async (e: React.FormEvent) => {
	// 	e.preventDefault();
	// 	if (!input.trim()) return;

	// 	const userMessage: Message = { role: 'user', content: input };
	// 	setMessages(prev => [...prev, userMessage]);
	// 	setInput('');
	// 	setIsLoading(true);

	// 	await storeMessage(userMessage, visitorName, visitorCompany, sessionId);

	// 	try {
	// 	  const { data, error } = await supabase.functions.invoke('chat', {
	// 		body: {
	// 		  messages: [...messages, userMessage],
	// 		  systemPrompt,
	// 		},
	// 	  });

	// 	  if (error) throw error;

	// 	  const assistantMessage = { 
	// 		role: 'assistant' as const, 
	// 		content: data.choices[0].message.content 
	// 	  };

	// 	  setMessages(prev => [...prev, assistantMessage]);

	// 	  await storeMessage(assistantMessage, visitorName, visitorCompany, sessionId);

	// 	  // Only try to extract visitor info from the first user message
	// 	  if (!visitorName && !visitorCompany && messages.length === 1) {
	// 		const nameMatch = userMessage.content.match(/(?:my name is|I'm|I am) ([^,.]+)/i);
	// 		const companyMatch = userMessage.content.match(/(?:from|with|at) ([^,.]+)/i);

	// 		if (nameMatch) setVisitorName(nameMatch[1].trim());
	// 		if (companyMatch) setVisitorCompany(companyMatch[1].trim());
	// 	  }

	// 	} catch (error) {
	// 	  console.error('Error calling chat function:', error);
	// 	  toast({
	// 		title: "Error",
	// 		description: "Failed to get a response. Please try again.",
	// 		variant: "destructive",
	// 	  });
	// 	} finally {
	// 	  setIsLoading(false);
	// 	}
	//   };

	return (
		<header>
			<nav data-state={menuState && 'active'} className="fixed z-50 w-full px-2 group">
				<div
					className={cn(
						'mx-auto mt-2 max-w-6xl px-6 border-white/20 transition-all rounded-2xl backdrop-blur-md duration-300 lg:px-12',
						isScrolled &&
						cn(
							'max-w-4xl rounded-2xl border backdrop-blur-md sm:backdrop-blur-lg lg:px-5',
							isDarkTheme ? 'bg-white/40 border-white/20' : 'bg-white/50 border-gray-200'
						)
					)}
				>
					<div className="relative flex flex-wrap items-center justify-between gap-6 py-2 lg:gap-0 lg:py-4">
						<div className="flex w-full justify-between lg:w-auto">
							<Link
								href="/"
								onClick={(e) => {
									if (window.location.pathname === '/') {
										e.preventDefault();
										window.scrollTo({
											top: 0,
											behavior: 'smooth'
										});
									}
								}}
								aria-label="home"
								className="flex items-center gap-2"
							>
								<Image
									height={10}
									width={10}
									alt="Heidel AI Logo"
									src="/heidelai.png"
									className="w-8 h-8 object-contain"
								/>
								<span
									className={cn(
										'text-xl font-medium transition-colors duration-300',
										isDarkTheme ? 'text-black' : 'text-gray-900'
									)}
								>
									Heidel AI
								</span>
							</Link>

							<button
								onClick={() => setMenuState(!menuState)}
								aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
								className={cn(
									'relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden transition-colors duration-300',
									isDarkTheme ? 'text-black' : 'text-gray-900'
								)}
							>
								<Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
								<X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
							</button>
						</div>

						<div className="absolute inset-0 m-auto hidden size-fit lg:block">
							<ul className="flex gap-8 text-sm">
								{menuItems.map((item, index) => (
									<li key={index}>
										<Link
											href={item.href}
											onClick={(e) => handleNavClick(e, item.href)}
											className={cn(
												'block duration-300 font-medium transition-colors',
												isDarkTheme
													? 'text-black hover:text-black'
													: 'text-gray-600 hover:text-gray-900'
											)}
										>
											<span>{item.name}</span>
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div
							className={cn(
								'group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none transition-all duration-300',
								isDarkTheme
									? 'bg-white border-white/20  shadow-black/20'
									: 'bg-white border-gray-200  shadow-gray-300/20'
							)}
						>
							<div className="lg:hidden">
								<ul className="space-y-6 text-base">
									{menuItems.map((item, index) => (
										<li key={index}>
											<a
												href={item.href}
												onClick={(e) => handleNavClick(e, item.href)}
												className={cn(
													'block duration-300 font-medium transition-colors',
													isDarkTheme
														? 'text-black/70 hover:text-black'
														: 'text-black/70 hover:text-black'
												)}
											>
												<span>{item.name}</span>
											</a>
										</li>
									))}
								</ul>
							</div>
							<div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
								<Button
									variant="outline"
									size="sm"
									className={cn(
										isScrolled && 'hidden',
										'backdrop-blur-sm transform hover:scale-105 transition-all duration-300',
										isDarkTheme
											? 'border-black bg-transparent text-black hover:bg-black/10 hover:text-black hover:border-black/50'
											: 'border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100 hover:border-gray-400'
									)}
									onClick={() => router.push('/login')}
								>
									<span>Login</span>
								</Button>
								{/* <Button
									size="sm"
									className={cn(
										isScrolled ? 'hidden' : 'lg:inline-flex',
										'backdrop-blur-sm transform focus-visible:ring-0 hover:scale-105 w-full transition-all duration-300 shadow-lg bg-white text-black hover:bg-white/90'
									)}
									onClick={() => router.push('/onboarding')}
								>
									<span>Sign Up</span>
								</Button> */}
								<ScheduleDemo trigger={
									<Button
										size="sm"
										className={cn(
											isScrolled ? 'lg:inline-flex' : 'hidden',
											'backdrop-blur-sm transform w-full hover:scale-105 transition-all duration-300 shadow-lg',
											isDarkTheme
												? ' bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] text-white border-none  shadow-[0_20px_50px_-15px_rgba(255,87,34,0.5)] hover:shadow-[0_30px_60px_-15px_rgba(255,87,34,0.6)] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 before:!hidden overflow-hidden  '
												: ' bg-gradient-to-r from-[#ff8c00] via-[#ff5722] to-[#ff1744] text-white border-none  shadow-[0_20px_50px_-15px_rgba(255,87,34,0.5)] hover:shadow-[0_30px_60px_-15px_rgba(255,87,34,0.6)] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 before:!hidden overflow-hidden  '
										)}
									>
										<span>Join Beta</span>
									</Button>
								} />
							</div>
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
};

export default Header;