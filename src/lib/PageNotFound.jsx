import { Link, useLocation } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-6xl font-display font-black text-muted-foreground/20">404</h1>
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Página no encontrada</h2>
          <p className="text-sm text-muted-foreground mt-2">
            La ruta <span className="text-foreground font-medium">"{location.pathname}"</span> no existe en esta aplicación.
          </p>
        </div>
        <Link to="/dashboard">
          <Button className="bg-primary hover:bg-primary/90">Ir al Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}