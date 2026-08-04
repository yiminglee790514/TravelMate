import { login } from "../services/authService";

export default function Login() {

  async function handleLogin() {

    try {

      await login();

    } catch (err) {

      alert(err.message);

    }

  }

  return (

    <div className="flex min-h-screen items-center justify-center bg-gray-100">

      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">

        <h1 className="mb-2 text-center text-4xl font-bold">
          ✈️ TravelMate
        </h1>

        <p className="mb-8 text-center text-gray-500">
          登入後即可同步所有旅程
        </p>

        <button
          onClick={handleLogin}
          className="w-full rounded-2xl bg-blue-500 py-4 text-lg font-semibold text-white hover:bg-blue-600"
        >
          使用 Google 登入
        </button>

      </div>

    </div>

  );

}