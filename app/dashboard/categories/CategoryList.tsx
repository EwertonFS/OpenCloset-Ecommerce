"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Pencil, PlusCircle } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { DeleteCategoryButton } from "../components/dashboard/DeleteCategoryButton";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    isArchived: boolean;
    parentId: string | null;
    products?: { name: string }[];
    children?: Category[];
}

interface CategoryListProps {
    categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const toggleExpand = (categoryId: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    return (
        <div className="space-y-4">
            {categories.map((category) => (
                <Card key={category.id} className="overflow-hidden border-none shadow-sm">
                    <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between bg-white border rounded-lg gap-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 flex-1 w-full">
                            <div className="min-w-[150px] font-bold text-gray-900">{category.name}</div>
                            <div className="text-sm text-muted-foreground min-w-[120px]">Main Category</div>
                            <div className="min-w-[100px]">
                                {category.isArchived ? (
                                    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Archived</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Active</Badge>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground flex-1">
                                {category.products?.length || 0} products
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <Button size="icon" variant="ghost" asChild title="Add Subcategory" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                                <Link href={`/dashboard/categories/create?parentId=${category.id}`}>
                                    <PlusCircle className="w-5 h-5" />
                                </Link>
                            </Button>
                            <Button size="icon" variant="ghost" asChild className="h-8 w-8 text-gray-500 hover:text-gray-700">
                                <Link href={`/dashboard/categories/${category.id}`}>
                                    <Pencil className="w-4 h-4" />
                                </Link>
                            </Button>
                            <div className="h-8 w-8 flex items-center justify-center">
                                <DeleteCategoryButton categoryId={category.id} />
                            </div>

                            {category.children && category.children.length > 0 && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => toggleExpand(category.id)}
                                    className="h-8 w-8 text-gray-500"
                                >
                                    {expandedCategories[category.id] ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Subcategories */}
                    {expandedCategories[category.id] && category.children && category.children.length > 0 && (
                        <div className="bg-gray-50/50 border-t">
                            {category.children.map((sub) => (
                                <div key={sub.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between border-b last:border-0 pl-4 md:pl-10 gap-4">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 flex-1 w-full">
                                        <div className="min-w-[150px] font-medium text-gray-700">{sub.name}</div>
                                        <div className="text-sm text-muted-foreground min-w-[120px]">Subcategory</div>
                                        <div className="min-w-[100px]">
                                            {sub.isArchived ? (
                                                <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Archived</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Active</Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground flex-1">
                                            {sub.products?.length || 0} products
                                        </div>
                                        <div className="text-sm text-muted-foreground italic hidden md:block">
                                            {category.name}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end md:mr-10">
                                        <Button size="icon" variant="ghost" asChild className="h-8 w-8 text-gray-500 hover:text-gray-700">
                                            <Link href={`/dashboard/categories/${sub.id}`}>
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <div className="h-8 w-8 flex items-center justify-center">
                                            <DeleteCategoryButton categoryId={sub.id} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            ))}
            {categories.length === 0 && (
                <div className="text-center p-10 text-muted-foreground">
                    No categories found.
                </div>
            )}
        </div>
    );
}
