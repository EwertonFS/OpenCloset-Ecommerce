"use client";

import { createCoupon } from "@/lib/action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useActionState, useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CouponFormProps {
    categories: { id: string; name: string; children: { id: string; name: string }[] }[];
    products: { id: string; name: string; variants: { id: string; sku: string; size: string; color: { name: string } }[] }[];
}

export default function CouponForm({ categories, products }: CouponFormProps) {
    const router = useRouter();
    const [state, formAction] = useActionState(createCoupon, null);
    const [scope, setScope] = useState<string>("all");
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<string>("");

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
        if (state?.success) {
            toast.success(state.success);
            setTimeout(() => {
                router.push("/dashboard/coupons");
            }, 1000);
        }
    }, [state, router]);

    const selectedProduct = products.find(p => p.id === selectedProductId);
    const selectedParentCategory = categories.find(c => c.id === selectedParentCategoryId);

    return (
        <form action={formAction}>
            <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/coupons">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold tracking-tight">Novo Cupom</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Cupom</CardTitle>
                    <CardDescription>
                        Crie um novo cupom de desconto para seus clientes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="code">Código do Cupom</Label>
                        <Input
                            id="code"
                            name="code"
                            type="text"
                            placeholder="EX: VERÃO2024"
                            className="uppercase"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="type">Tipo de Desconto</Label>
                            <Select name="type" defaultValue="percentage" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label htmlFor="discount">Valor do Desconto</Label>
                            <Input
                                id="discount"
                                name="discount"
                                type="number"
                                placeholder="Ex: 10"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label htmlFor="expiresAt">Data de Expiração (Opcional)</Label>
                        <Input
                            id="expiresAt"
                            name="expiresAt"
                            type="date"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label>Aplicar Cupom Em</Label>
                        <Select value={scope} onValueChange={(val) => { setScope(val); setSelectedProductId(""); setSelectedParentCategoryId(""); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o escopo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Produtos</SelectItem>
                                <SelectItem value="category">Categoria Específica</SelectItem>
                                <SelectItem value="subcategory">Subcategoria Específica</SelectItem>
                                <SelectItem value="product">Produto Específico</SelectItem>
                                <SelectItem value="variant">Variante Específica</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {scope === "category" && (
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="categoryId">Selecione a Categoria</Label>
                            <Select name="categoryId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {scope === "subcategory" && (
                        <>
                            <div className="flex flex-col gap-3">
                                <Label>Selecione a Categoria Pai</Label>
                                <Select value={selectedParentCategoryId} onValueChange={setSelectedParentCategoryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a categoria pai" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedParentCategoryId && selectedParentCategory && (
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="categoryId">Selecione a Subcategoria</Label>
                                    <Select name="categoryId" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma subcategoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedParentCategory.children.length > 0 ? (
                                                selectedParentCategory.children.map((sub) => (
                                                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="none" disabled>Nenhuma subcategoria encontrada</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </>
                    )}

                    {scope === "product" && (
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="productId">Selecione o Produto</Label>
                            <Select name="productId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um produto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((prod) => (
                                        <SelectItem key={prod.id} value={prod.id}>{prod.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {scope === "variant" && (
                        <>
                            <div className="flex flex-col gap-3">
                                <Label>Selecione o Produto</Label>
                                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Primeiro selecione um produto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((prod) => (
                                            <SelectItem key={prod.id} value={prod.id}>{prod.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedProductId && selectedProduct && (
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="variantId">Selecione a Variante</Label>
                                    <Select name="variantId" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma variante" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedProduct.variants.map((variant) => (
                                                <SelectItem key={variant.id} value={variant.id}>
                                                    {variant.sku} - {variant.color.name} - {variant.size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </>
                    )}

                </CardContent>
                <CardFooter>
                    <Button type="submit">Criar Cupom</Button>
                </CardFooter>
            </Card>
        </form>
    );
}
