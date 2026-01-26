import logo from '@/assets/logo.png';

export const AuthLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <img
        src={logo}
        alt="Orlando Fast Pass"
        className="w-40 h-auto mb-6"
      />
      
      {/* Simple CSS-only loading dots */}
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
      </div>
      
      <p className="text-muted-foreground text-sm mt-4">
        Carregando...
      </p>
    </div>
  );
};
