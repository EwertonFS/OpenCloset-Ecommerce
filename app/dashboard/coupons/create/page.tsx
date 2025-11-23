import { prisma } from "@/lib/prisma";
import CouponForm from "./CouponForm";

async function getData() {
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        select: {
            id: true,
            name: true,
            children: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: { name: 'asc' },
    });

    const products = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            variants: {
                select: {
                    id: true,
                    sku: true,
                    size: true,
                    color: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: { name: 'asc' },
    });

    return { categories, products };
}

export default async function CreateCouponPage() {
    const { categories, products } = await getData();

    return (
        <CouponForm categories={categories} products={products} />
    );
}
