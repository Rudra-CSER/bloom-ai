import { assets } from '@/assets/assets'
import Image from 'next/image'
import React, { use, useState } from 'react'
import { useClerk ,UserButton } from '@clerk/nextjs'
import { useAppContext } from '@/context/AppContext'
import ChatLable from '@/public/components/ChatLable'

const Sidebar = ({ expand, setExpand }) => {
  const {openSignIn}= useClerk()
   const{user} = useAppContext()
   const [openMenu , setOpenMenu] = useState({id: 0 , open: false })
  
  return (


    
    <div className={`flex flex-col justify-between bg-[#212327] pt-7 transition-all z-50 max-md:absolute max-md:h-screen ${expand ? 'p-4 w-67.5' : 'md:w-20 w-0 max-md:overflow-hidden '}`}>
      <div>
        <div onClick={() => expand ? setExpand(false) : setExpand(true)} className={`flex ${expand ? "flex-row gap-10 " : "flex-col items-center gap-8"}`}>

          <Image className={expand ? "w-48 " : "w-10"} src={expand ? assets.logo_text : assets.logo_icon} alt='' />
          <div className='group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 aspect-square rounded-lg cursor-pointer'>
            <Image src={assets.menu_icon} alt='' className='md:hidden' />
            <Image src={expand ? assets.sidebar_close_icon : assets.sidebar_icon} alt='' className='hidden md:block w-7' />
            <div className={`absolute w-max ${expand ? "left-1/2 -translate-x-1/2 top-12" : "-top-12 left-0"} opacity-0 group-hover:opacity-100 transition bg-[#16191c] text-white px-3 py-3 rounded-lg shadow-lg pointer-events-none`}>
              {expand ? 'Close SideBar' : 'Open Sidebar'}
              <div className={`w-3 h-3 absolute bg-black rotate-45 ${expand ? 'left-1/2 -top-1.5 -translate-x-1/2' : ' left-4 -bottom-1.5'} `}></div>
            </div>
          </div>
          {/*  */}
        </div>
        {/* <<<--- New chat of extend bar --->>> */}
        <button className={`mt-8 flex items-center justify-center cursor-pointer ${expand ? "bg-primary hover-opacity-90 rounded-2xl gap-2  p-2.5 w-max" : "group relative h-9 w-9 hover:bg-gray-500/30  rounded-lg gap-2 mx-auto"} `}>
          <Image className={expand ? 'w-6' : 'w-7'} src={expand ? assets.chat_icon : assets.chat_icon_dull} alt='' />
          <div className='absolute w-max -top-12 -right-12 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none'>
            New Chat
            <div className='w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5 '></div>
          </div>
          {expand && <p className='text-white font-medium'>New chat</p>}
        </button>

        <div className={`mt-8 text-white/23 text text-sm ${expand ? "block" : "hidden"}`}>
          <p className='my-1  '>Recents </p>
          <ChatLable openMenu={openMenu} setOpenMenu={setOpenMenu} />
        </div>

      </div>


      {/* Extended nav-bar Footer */}
      <div>
        <div className={`flex items-center cursor-pointer group relative ${expand ? "gap-1 text-white/80 text-sm p-2.5 border border-primary rounded-lg hover:bg-white/13 cursor-pointer" : "h-10 w-10 mx-auto hover:bg-gray-500/30 rounded-lg"}`}>
          <Image className={expand ? 'w-5' : "w-6.5 mx-auto"} src={expand ? assets.phone_icon : assets.phone_icon_dull} alt='' />

          <div className={`absolute -top-60 pb-8 ${!expand && "-right-40"} opacity-0 group-hover:opacity-100 hidden group-hover:block transition`}>
            <div className='relative w-max bg-black text-white text-sm p-2  rounded-lg shadow-lg'>
              <Image src={assets.qrcode} alt='' className='w-44' />
              <p className=' flex justify-center'>Scan to get Bloom Ai</p>
              <div className={`w-3 h-3 absolute bg-black rotate-45 ${expand ? "right-1/2" : "left-4"} -bottom-1.4`}></div>
            </div>
          </div>
          {expand && <> <span>Get App</span><Image src={assets.new_icon} alt='' /></>}
        </div>
        <div onClick={user ? null : openSignIn} className={`flex items-center ${expand ? 'hover:bg-white/10 rounded-lg' : 'justify-center w-full'} gap-3 text-wite/60 text-sm p-2 mt-2 cursor-pointer`}>
        
        {
         user ? <UserButton/> 
         : <Image src={assets.profile_icon} alt='' className='w-7' />
         
        }

          {expand && <span className='text-white/60'>My Profile</span>}
        </div>
      </div>
    </div>

  )
}

export default Sidebar