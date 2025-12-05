"use client";
import Link from "next/link";
import { Button } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import BookAnimation from "./components/BookAnimation/BookAnimation";
import NavBar from "./components/NavBar/NavBar";
import { Users } from "lucide-react";

export default function Home() {  
  return (
    <div>
      
        <NavBar/>
        
        <div className="mt-10 ">
          .
          <BookAnimation/>
        </div>
        <div className="flex justify-center text-black mt-12 font-bold font-serif text-5xl">Descubra Mundos</div>
        <div className="flex justify-center text-orange-300 font-bold font-serif text-5xl">Infinitos</div>
        <div className=" text-neutral-700 flex justify-center text-center mt-5"><p className="w-250 text-lg md:text-xl mb-10 leading-relaxed">
                  Explore nossa vasta coleção de livros e embarque em jornadas 
                  através de histórias que transformam, inspiram e encantam.
        </p></div>
        <div className="flex justify-center mt-10 gap-5">
          <Link href="/livros" className="px-8 py-4 bg-green-900 text-primary-foreground rounded-lg font-display text-lg
                              hover:bg-green-900/90 transition-all duration-300 flex items-center justify-center gap-2
                              shadow-lg hover:shadow-xl hover:-translate-y-0.5"><SearchIcon className="mr-2"/>Explorar Catálogo</Link>
          <Link href="/cadastro" className="px-8 py-4 bg-neutral-200 text-black rounded-lg font-display text-lg
                              hover:bg-orange-400/70 transition-all duration-300 flex items-center justify-center gap-2
                              shadow-lg hover:shadow-xl hover:-translate-y-0.5"><Users className="w-5 h-5"/>Criar Conta</Link>
        </div>
    </div>
  );
}
