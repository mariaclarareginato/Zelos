export default function NotFound() {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden">

        {/* Vídeo de fundo */}
        
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/video/intro.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos em HTML5.
        </video>
  
        {/* Contraste */}

        <div className="absolute inset-0 bg-black/60"></div>
  
        {/* Animação por cima do vídeo */}

        <div className="absolute w-[600px] h-[600px] rounded-full bg-red-500/30 blur-3xl animate-pulse"></div>
  
        {/* Conteúdo */}

        <h1 className="text-[8rem] font-extrabold drop-shadow-lg z-10 animate-bounce">
          404
        </h1>
  
        <p className="text-xl mb-10 text-gray-200 z-10">
        Oops! A página que você procura não foi encontrada.
        </p>
  
<br />
<br />

<a
  href="/home"
  className="w-60 h-20 bg-red-600 text-white font-bold rounded-md shadow-lg flex items-center justify-center hover:bg-red-800 hover:scale-105 transform transition-all duration-300 z-10"
>
  Voltar para Home
</a>




      </div>
    );
  }
  