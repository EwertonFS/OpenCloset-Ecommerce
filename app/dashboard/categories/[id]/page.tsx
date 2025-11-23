import { CategoryForm } from "@/app/dashboard/components/dashboard/CategoryForm";
import { getCategories } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const category = await prisma.category.findUnique({
        where: { id: id },
    });

    if (!category) {
        return notFound();
    }

    const categories = await getCategories();

    return (
        <CategoryForm data={category} categories={categories} />
    );
}
