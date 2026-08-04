export default function Header() {
  return (
    <header className="mb-10">

      <div className="flex items-center gap-3">

        <div className="text-5xl">
          🌏
        </div>

        <div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            行程規劃
          </h1>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-lg font-semibold text-transparent">
            Plan Every Journey
          </div>

        </div>

      </div>

      <p className="mt-4 text-gray-500">
        規劃每一次旅行，留下每一段回憶 ✈️
      </p>

    </header>
  );
}