import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold mb-6">Duo Productivity</h1>
      <SignIn routing="path" path="/login" signUpUrl="/login" />
    </main>
  );
}
