import { clerkClient } from "@clerk/nextjs/server";
import { User } from "@clerk/nextjs/dist/api";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const customFilterUser = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profile: user.profileImageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(customFilterUser);

    console.log(users);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author not found",
        });
      }
      return {
        post,
        author,
      };
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
