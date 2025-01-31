import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
	return (
		<nav className="bg-transparent text-paper max-w-5xl mx-auto p-6">
			<div className="flex items-center justify-between">
				<Link href="/" className="font-newsreader font-semibold text-xl gap-2 flex items-center">
					<span className="text-2xl">🍫</span>
					SNACK
				</Link>

				<div className="flex items-center gap-8">
					<div className="flex items-center gap-6">
						<Link
							href="/docs"
							className="text-paper hover:text-gray-300 transition-colors"
						>
							Docs
						</Link>
						<Link
							href="/about"
							className="text-paper hover:text-gray-300 transition-colors"
						>
							About
						</Link>
					</div>

					<Button variant="paper">
						Get Started
					</Button>
				</div>
			</div>
		</nav>
	);
}
