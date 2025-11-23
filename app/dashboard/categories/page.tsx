import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategories } from "@/lib/action";
import { PlusCircle, Pencil } from "lucide-react";
import Link from "next/link";
import React from "react";
import { DeleteCategoryButton } from "../components/dashboard/DeleteCategoryButton";

export default async function CategoriesPage() {
  const categories = await getCategories();

  // Filter only parent categories (where parentId is null)
  // The getCategories function returns all categories, but we want to structure them hierarchically
  // However, getCategories includes 'children', so we should filter for parents first
  const parentCategories = categories.filter((c) => c.parentId === null);

  return (
    <>
      <div className="flex items-center justify-end">
        <Button asChild className="flex gap-x-2">
          <Link href="/dashboard/categories/create">
            <PlusCircle className="h-3.5 w-3.5" />
            Add Category
          </Link>
        </Button>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage your product categories and subcategories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parentCategories.map((category) => (
                <React.Fragment key={category.id}>
                  {/* Parent Category */}
                  <TableRow>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                      {category.products && category.products.length > 0
                        ? category.products.map(p => p.name).join(", ")
                        : "No products"}
                    </TableCell>
                    <TableCell>
                      {(category as unknown as { isArchived: boolean }).isArchived ? (
                        <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Archived</span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Active</span>
                      )}
                    </TableCell>
                    <TableCell>Main Category</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button size="icon" variant="ghost" asChild title="Add Subcategory">
                        <Link href={`/dashboard/categories/create?parentId=${category.id}`}>
                          <PlusCircle className="w-4 h-4 text-green-600" />
                        </Link>
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <Link href={`/dashboard/categories/${category.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <DeleteCategoryButton categoryId={category.id} />
                    </TableCell>
                  </TableRow>
                  {/* Subcategories */}
                  {category.children?.map((sub) => (
                    <TableRow key={sub.id} className="bg-muted/50">
                      <TableCell className="pl-10">{sub.name}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                        {sub.products && sub.products.length > 0
                          ? sub.products.map(p => p.name).join(", ")
                          : "No products"}
                      </TableCell>
                      <TableCell>
                        {(sub as unknown as { isArchived: boolean }).isArchived ? (
                          <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Archived</span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Active</span>
                        )}
                      </TableCell>
                      <TableCell>Subcategory</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button size="icon" variant="ghost" asChild>
                          <Link href={`/dashboard/categories/${sub.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </Button>
                        <DeleteCategoryButton categoryId={sub.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
