import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prisma";
import { PersonalDetailsForm } from "./components/PersonalDetailsForm";



export default async function MyPersonalPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        // Or handle unauthenticated user appropriately
        return <div>Please log in to see your personal details.</div>;
    }

    // Use upsert to avoid race condition when multiple requests try to create the same user
    let dbUser;

    try {
        dbUser = await prisma.user.upsert({
            where: { id: user.id },
            update: {
                firstName: user.given_name ?? "",
                lastName: user.family_name ?? "",
                email: user.email ?? "",
                profileImage: user.picture,
            },
            create: {
                id: user.id,
                firstName: user.given_name ?? "",
                lastName: user.family_name ?? "",
                email: user.email ?? "",
                profileImage: user.picture,
            },
        });
    } catch (error: unknown) {
        // If upsert fails due to email constraint, try to find by email
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
            dbUser = await prisma.user.findUnique({
                where: { email: user.email ?? "" },
            });

            // If found, update the ID to match Kinde
            if (dbUser && dbUser.id !== user.id) {
                dbUser = await prisma.user.update({
                    where: { id: dbUser.id },
                    data: {
                        id: user.id,
                        firstName: user.given_name ?? "",
                        lastName: user.family_name ?? "",
                        profileImage: user.picture,
                    },
                });
            }
        } else {
            throw error;
        }
    }

    if (!dbUser) {
        return <div>Erro ao carregar dados do usuário.</div>;
    }

    return <PersonalDetailsForm user={dbUser} />;
}