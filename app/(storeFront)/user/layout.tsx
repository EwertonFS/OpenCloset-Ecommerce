
import UserSidebar from "@/app/components/UserSidebar";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    return (
        <div className="flex">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <UserSidebar user={user as any} />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
