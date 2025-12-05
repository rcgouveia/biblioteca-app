import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import Link from "next/link";

export default function NavBar(){
    return(
        <>
            <div className="bg-white w-full h-24 flex items-center text-neutral-900 shadow-2xs">
                <AutoStoriesIcon className='ml-5' sx={{ fontSize: 40 }}/>
                <div className="ml-3 font-bold text-4xl">Biblioteca</div>
                <div className='pl-250'>
                    <Link href="/" className="px-3 py-2 rounded transition
                    hover:bg-gray-700/20 hover:backdrop-blur-sm">Inicio</Link>
                    <Link href="/livros" className="px-3 py-2 rounded transition
                    hover:bg-gray-700/20 hover:backdrop-blur-sm">Livros</Link>
                    <Link href="/emprestimo"className='px-3 py-2 rounded transition
                    hover:bg-gray-700/20 hover:backdrop-blur-sm'>Empréstimo</Link>
                    <Link href="/reserva"className='px-3 py-2 rounded transition
                    hover:bg-gray-700/20 hover:backdrop-blur-sm'>Reserva</Link>
                    <Link href="/login" className='px-3 py-2 rounded transition
                    hover:bg-gray-700/20 hover:backdrop-blur-sm'>Login</Link>
                </div>
            </div>
            
        </> 
    )
}