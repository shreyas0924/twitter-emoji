import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { RouterOutputs, api } from "~/utils/api";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { Loading, LoadingPage } from "~/components/Loading";
import { useState } from "react";
import { toast } from "react-hot-toast";

dayjs.extend(relativeTime);

const CreatePost = () => {
  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again");
      }
    },
  });

  const [input, setInput] = useState<string>("");

  if (!user) return null;
  return (
    <div className="flex w-full gap-4">
      <Image
        src={user?.profileImageUrl}
        alt="Profile pic"
        className="h-12 w-12 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Type some emojis"
        className=" mr-3 grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
            setInput("");
          }
        }}
      />
      {input !== "" && !isPosting && (
        <button
          className="mr-2 cursor-pointer"
          onClick={() => mutate({ content: input })}
        >
          Post
        </button>
      )}
      {isPosting && (
        <div className="mr-2 flex items-center justify-center">
          <Loading size={30} />
        </div>
      )}
    </div>
  );
};

//PostView - Structure of the post
type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex gap-3 border-b border-slate-400 p-4" key={post.id}>
      <Image
        src={author.profile}
        className="h-12 w-12 rounded-full"
        alt={"Profile image"}
        width={56}
        height={56}
      />
      <div className="flex flex-col ">
        <div className="flex gap-1 font-bold text-slate-300">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{` · ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

//Feed Component
const Feed = () => {
  const { data, isLoading } = api.posts.getAll.useQuery();
  if (isLoading) return <LoadingPage />;
  if (!data) return <div>Something is wrong</div>;
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded, isSignedIn } = useUser();

  //start fetching data early
  api.posts.getAll.useQuery();

  if (!isLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Twitter-Emoji</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/icons8-twitter-16.png" />
      </Head>
      <main className="flex justify-center">
        <div className="h-screen w-full border-x border-slate-400 md:max-w-2xl">
          {isSignedIn && (
            <div className="mt-3 mb-3 flex">
              <div className="ml-5 text-lg">Home</div>
              <div className="ml-auto mr-5 text-right text-lg">
                {isSignedIn && <SignOutButton />}
              </div>
            </div>
          )}
          <div className="flex border-b border-slate-400 p-4 ">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && <CreatePost />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;

////AUTH
const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
