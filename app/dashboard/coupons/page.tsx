import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteCouponButton } from "./DeleteCouponButton";

async function getData() {
    const data = await prisma.coupon.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return data;
}

export default async function CouponsPage() {
    const data = await getData();

    return (
        <>
            <div className="flex items-center justify-end">
                <Button asChild className="flex items-center gap-x-2">
                    <Link href="/dashboard/coupons/create">
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Criar Cupom</span>
                    </Link>
                </Button>
            </div>

            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Cupons</CardTitle>
                    <CardDescription>Gerencie os cupons de desconto da sua loja.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Desconto</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Expira em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.code}</TableCell>
                                    <TableCell>
                                        {item.type === "fixed"
                                            ? new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(item.discount)
                                            : `${item.discount}%`}
                                    </TableCell>
                                    <TableCell>
                                        {item.type === "fixed" ? "Fixo" : "Porcentagem"}
                                    </TableCell>
                                    <TableCell>
                                        {item.expiresAt
                                            ? new Intl.DateTimeFormat("pt-BR").format(item.expiresAt)
                                            : "Sem validade"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DeleteCouponButton couponId={item.id} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
