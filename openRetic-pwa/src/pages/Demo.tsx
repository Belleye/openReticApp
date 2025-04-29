import { Button } from "@/components/ui/button";

const Demo = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Shadcn + Tailwind Test
      </h1>
      <Button variant="default">Shadcn Button</Button>
      <p className="mt-4 text-gray-600">
        If you see this styled correctly, Tailwind and Shadcn are working.
      </p>
    </div>
  );
};

export default Demo;
