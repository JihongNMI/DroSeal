import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          username: form.email,
          password: form.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      // JWT 저장 예시
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("email", response.data.email);
      // 홈 이동
      navigate("/");
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data);
        alert("로그인 실패");
      } else {
        alert("로그인 실패");
      }
    }
  };

  return (
    <div className="flex items-center justify-center mt-20">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">회원 가입</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            로그인
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          계정이 없으신가요?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
