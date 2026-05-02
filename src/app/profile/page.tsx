import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { requireAppUser } from "../../lib/dal";
import { Card } from "../../components/ui/card";
import { Eyebrow } from "../../components/ui/eyebrow";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const me = await requireAppUser();

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-6 pb-24">
        <section className="w-full max-w-[720px] flex flex-col gap-6">
          <div>
            <Eyebrow>Account</Eyebrow>
            <h1 className="mt-1 text-[28px] font-medium text-[#3b6e45]">
              Profile
            </h1>
            <p className="mt-2 text-[14px] leading-[1.7] text-[#5a7a5a]">
              Your display name is what your partner sees on the dashboard.
            </p>
          </div>
          <Card className="p-6">
            <ProfileForm email={me.email} initialName={me.name} />
          </Card>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
