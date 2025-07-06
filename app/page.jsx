'use client';
import {assets} from "@/assets/assets"
import Sidebar from "@/public/components/Sidebar";
import PromptBox from "@/public/components/PromptBox";
import Image from "next/image";
import { useState } from "react";
import Massages from '../public/components/Massages'
export default function Home() {
  
  const [expand , setExpand ] = useState(false)
  const [massages , setMassages ] = useState([])
  const [isLoading , setIsLoading ] = useState(false)
  
  return (
    <div> 
      <div className="flex h-screen ">
       <Sidebar expand={expand} setExpand={setExpand}/>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 
        bg-[#202123] text-white relative"> 
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
            <Image onClick={()=> (expand ? setExpand(false) : setExpand(true))} className="rotate-180" src={assets.menu_icon} alt="" />
            <Image className="opacity-70" src={assets.chat_icon} alt="" />
          </div>
          {massages.length === 0 ? (
            
            <>
            <div className="flex items-center gap-3"  >
              <Image src={assets.logo_icon} alt="" className="h-16" />
              <p className="text-3xl font-medium">Hi I'am Bloom-Ai.</p>
            </div>
            <p className="text-sm mt-2 top-8 justify-center
 " >How Can I help you today?</p>
            </ >
          ):
        (
        <Massages role='AI
      ' content=' Sample prompt ' />
        )
        }
        <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />
        <p className="text-xs absolute bottom-1 text-gray-500/95 "> AI-Genarated , for reference only</p>
        </div>
      </div>
    </div>
  );
}
