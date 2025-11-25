import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/action";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import React from "react";
import { CategoryList } from "./CategoryList";

export default async function CategoriesPage() {
  const categories = await getCategories();

  // Filter only parent categories (where parentId is null)
  // The getCategories function returns all categories, but we want to structure them hierarchically
  // However, getCategories includes 'children', so we should filter for parents first
  const parentCategories = categories.filter((c) => c.parentId === null);

  return (
    <>
      <div className="flex items-center justify-end mb-5">
        <Button asChild className="flex gap-x-2">
          <Link href="/dashboard/categories/create">
            <PlusCircle className="h-3.5 w-3.5" />
            Add Category
          </Link>
        </Button>
      </div>

      <CategoryList categories={parentCategories as any} />
    </>
  );
}
