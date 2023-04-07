
import { api } from "~/utils/api";
import {  useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Loading } from "~/components/Loading";
import { useState } from "react";
import { toast } from "react-hot-toast";


export const CreatePost = () => {
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