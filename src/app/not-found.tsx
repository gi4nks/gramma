import Link from "next/link";
import { Home, Frown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="bg-base-300/50 p-6 rounded-full">
        <Frown size={48} className="opacity-50" />
      </div>
      <h1 className="text-6xl font-black italic">404</h1>
      <p className="text-xl opacity-60 max-w-md">
        Questa pagina non esiste. Forse è stata mangiata.
      </p>
      <Link href="/" className="btn btn-primary btn-lg rounded-2xl gap-3 mt-4 shadow-lg shadow-primary/20">
        <Home size={20} /> Torna alla Dashboard
      </Link>
    </div>
  );
}
