import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ kindeAuth: string }> }
) => {
  const { kindeAuth } = await context.params;

  const handler = handleAuth(request, kindeAuth);

  // handleAuth retorna uma função que precisa ser executada
  if (typeof handler === 'function') {
    const response = await handler(request, {});
    return response;
  }

  return handler;
};