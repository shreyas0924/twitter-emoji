import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";

const ProfilePage: NextPage = () => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username: "shreyas0924",
  });

  if (isLoading) return <LoadingPage />;
  if (!data) return <div>404</div>;

  console.log(data);

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex justify-center">{data.username}</main>
    </>
  );
};

export default ProfilePage;
