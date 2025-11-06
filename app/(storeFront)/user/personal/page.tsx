import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prisma";
import { PersonalDetailsForm } from "../order/components/PersonalDetailsForm";

export default async function MyPersonalPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        // Or handle unauthenticated user appropriately
        return <div>Please log in to see your personal details.</div>;
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
    });

    // Ensure we have a user from our DB, create if not exists
    if (!dbUser) {
        // This logic might be better placed in a central place on user login
        const newUser = await prisma.user.create({
            data: {
                id: user.id,
                firstName: user.given_name ?? "",
                lastName: user.family_name ?? "",
                email: user.email ?? "",
                profileImage: user.picture,
            }
        });
        return <PersonalDetailsForm user={newUser} />;
    }

    return <PersonalDetailsForm user={dbUser} />;
}
