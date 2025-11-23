import { CategoryForm } from "@/app/dashboard/components/dashboard/CategoryForm";
import { getCategories } from "@/lib/action";

export default async function CreateCategoryPage({
    searchParams,
}: {
    searchParams: Promise<{ parentId?: string }>;
}) {
    const { parentId } = await searchParams;
    const categories = await getCategories();

    // Create a partial category object with the parentId pre-filled
    const initialData = parentId ? { parentId } : undefined;

    return (
        // @ts-expect-error - Partial data is fine for initial values
        <CategoryForm categories={categories} data={initialData} />
    );
}
