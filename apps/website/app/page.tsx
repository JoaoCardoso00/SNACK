import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="bg-dark flex-1 items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center justify-center gap-10 mt-10">
        <div className="flex flex-col items-center justify-center gap-6">
          <h1 className="text-paper text-center font-newsreader text-7xl font-semibold">Self-hosted CMS toolkit. </h1>
          <h1 className="text-paper text-center font-newsreader text-7xl font-semibold">built for Next.js</h1>
          <p className="text-paper font-semibold">A flexible, type-safe CMS that puts you in control of your data and infrastructure</p>
        </div>
        <div className="flex gap-4">
          <Button variant="paper">
            Getting Started
          </Button>
          <Button variant='paper-outline'>
            Check out the docs →
          </Button>
        </div>
      </div>
    </div>
  );
}
