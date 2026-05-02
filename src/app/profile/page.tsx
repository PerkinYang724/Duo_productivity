import Header from "../components/Header";
import { requireAppUser } from "../../lib/dal";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const me = await requireAppUser();

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <section className="w-full max-w-md">
          <h1 className="text-xl font-semibold mb-1">Profile</h1>
          <p className="text-sm text-zinc-500 mb-6">
            Your name is what your partner sees on the dashboard.
          </p>
          <ProfileForm email={me.email} initialName={me.name} />
        </section>
      </main>
    </>
  );
}
