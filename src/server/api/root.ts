import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { postsRouter } from "./routers/posts";
import { profileRouter } from "./routers/profile";

//All routers are present here

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  posts: postsRouter,
  profile: profileRouter,
  
});

// export type definition of API
export type AppRouter = typeof appRouter;
