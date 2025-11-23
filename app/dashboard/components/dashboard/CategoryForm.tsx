"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createCategory, updateCategory } from "@/lib/action";
import { categorySchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Category } from "@prisma/client";

type CategoryFormSchema = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    data?: Category; // For edit mode
    categories: Category[]; // For parent selection
}

interface ExtendedCategory extends Category {
    isArchived: boolean;
}

export function CategoryForm({ data, categories }: CategoryFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<CategoryFormSchema>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: data?.name || "",
            parentId: data?.parentId || null,
            isArchived: (data as unknown as ExtendedCategory)?.isArchived || false,
        },
    });

    const onSubmit = (values: CategoryFormSchema) => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("name", values.name);
            if (values.parentId) {
                formData.append("parentId", values.parentId);
            }
            formData.append("isArchived", values.isArchived ? "true" : "false");

            if (data?.id) {
                formData.append("categoryId", data.id);
                const result = await updateCategory(formData);
                if (result?.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Category updated successfully");
                    router.push("/dashboard/categories");
                }
            } else {
                const result = await createCategory(formData);
                if (result?.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Category created successfully");
                    router.push("/dashboard/categories");
                }
            }
        });
    };

    // Filter out the current category from parent options to avoid circular dependency
    const parentOptions = categories.filter(c => c.id !== data?.id && !c.parentId);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/categories">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold tracking-tight">
                    {data ? "Edit Category" : "New Category"}
                </h1>
            </div>

            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                    <CardDescription>
                        {data ? "Edit the category details below." : "Create a new category for your products."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <Label>Name</Label>
                            <Input
                                placeholder="Category Name"
                                {...form.register("name")}
                            />
                            {form.formState.errors.name && (
                                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>Status</Label>
                            <Select
                                onValueChange={(value) => form.setValue("isArchived", value === "archived")}
                                defaultValue={(data as unknown as ExtendedCategory)?.isArchived ? "archived" : "active"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="flex flex-col gap-3">
                            <Label>Parent Category (Optional)</Label>
                            <Select
                                onValueChange={(value) => form.setValue("parentId", value === "none" ? null : value)}
                                defaultValue={data?.parentId || "none"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a parent category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (Main Category)</SelectItem>
                                    {parentOptions.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Category"
                        )}
                    </Button>
                </CardFooter>
            </Card >
        </form >
    );
}
