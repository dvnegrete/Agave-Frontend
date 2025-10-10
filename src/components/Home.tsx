export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Bienvenido</h1>

      <img
        className="rounded-md mt-3 md:mt-0"
        width={300}
        height={300}
        src="/el-agave-2.png"
        alt="El Agave"
      />

      <a
        href="/login"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg mb-4 my-5 py-2 px-4 rounded"
      >
        Iniciar Sesión
      </a>
    </main>
  );
}
