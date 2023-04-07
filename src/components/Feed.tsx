import { api } from "~/utils/api";
import { LoadingPage } from "./Loading";
import { PostView } from "./PostView";

//Feed Component
export const Feed = () => {
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