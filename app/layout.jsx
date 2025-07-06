import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// You can use this metadata in your head component if needed
export const metadata = {
  title: "Bloom Ai",
  description: "Full Stack Mern Project",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider >
       <AppContextProvider>

    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
    </AppContextProvider>
   </ClerkProvider>
   
  );
}
