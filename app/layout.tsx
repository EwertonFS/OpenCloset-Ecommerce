import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Anton, Poppins } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "OpenCloset Store",
  description: "Seja feroz. Seja FoxFit",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const { getUser } = getKindeServerSession();
  // const user = await getUser();

  // if (user) {
  //   const dbUser = await prisma.user.findUnique({
  //     where: {
  //       id: user.id,
  //     },
  //   });

  //   if (!dbUser) {
  //     await prisma.user.create({
  //       data: {
  //         id: user.id,
  //         firstName: user.given_name ?? "",
  //         lastName: user.family_name ?? "",
  //         email: user.email ?? "",
  //         profileImage: user.picture,
  //       },
  //     });
  //   }
  // }

  return (
    <html lang="br" suppressHydrationWarning>
      <body
        className={`${anton.variable} ${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}