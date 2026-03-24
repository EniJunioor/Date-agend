import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      coupleId?: string | null;
      locale?: string;
    };
  }

  interface User {
    coupleId?: string | null;
    locale?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    coupleId?: string | null;
    locale?: string;
  }
}
