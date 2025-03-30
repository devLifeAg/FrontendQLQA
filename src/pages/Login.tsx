import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@mui/material";
import { showSuccessToast, showErrorToast } from '../components/ToastService/ToastService';

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    try {
      const response = await fetch(
        "https://quanlyquananapi-production.up.railway.app/api/login",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setLoading(false);

      if (data.result === 1) {
        showSuccessToast('Đăng nhập thành công!');
        localStorage.setItem("user", JSON.stringify(data.user)); // Lưu thông tin user vào localStorage
        navigate("/Home"); // Chuyển hướng về trang chủ
      } else {
        showErrorToast('Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } catch (error) {
      showErrorToast((error as Error).message);
      setLoading(false);

    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{
        background: "linear-gradient(90deg, #4B2E0F, #8B4513)",
        position: 'relative'
      }}
    >
      {/* Chữ "NHÀ HÀNG" bên trái */}
      <div
        className="absolute inset-y-0 left-15 h-full flex items-center justify-center flex-col 
  hidden md:hidden xl:flex xl:text-[8rem]"
        style={{
          fontFamily: 'Noto Serif, serif',
          color: '#F0E68C',
          // fontSize: '8rem',
          fontWeight: 'bold',
          padding: '10px'
        }}
      >
        <div>NHÀ</div>
        <div>HÀNG</div>
      </div>

      {/* Logo và Form đăng nhập */}
      <div className="flex flex-col items-center justify-center">
        <div style={{ position: 'relative', width: '260px', height: '260px' }}>
          <img src="logo.png" alt="Logo Nhà Hàng" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#F0E68C',
              mixBlendMode: 'multiply',
              borderRadius: '50%',
            }}
          />
        </div>

        <Card className=" mt-3 w-96 shadow-lg" style={{ backgroundColor: '#F0E68C' }}>
          <CardContent className="p-6">
            <h1 className="text-xl font-bold mb-4 text-center" style={{ fontFamily: 'Noto Serif, serif', fontWeight: 'bold', color: '#8B4513' }}>
              Đăng nhập
            </h1>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Tên đăng nhập"
                className="border p-2 rounded"
                style={{ borderColor: '#8B4513' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                className="border p-2 rounded"
                style={{ borderColor: '#8B4513' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded ${loading ? "bg-gray-400" : ""}`}
                style={{
                  backgroundColor: loading ? "#D3D3D3" : "#8B4513",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onMouseOver={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = "#A0522D";
                }}
                onMouseOut={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = "#8B4513";
                }}
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Chữ "HẢO HÁN" bên phải */}
      <div
        className="absolute inset-y-0 right-15 h-full flex items-center justify-center flex-col 
  hidden md:hidden xl:flex xl:text-[8rem]"
        style={{
          fontFamily: 'Noto Serif, serif',
          color: '#F0E68C',
          // fontSize: '8rem',
          fontWeight: 'bold',
          padding: '10px'
        }}
      >
        <div>HẢO</div>
        <div>HÁN</div>
      </div>
    </div>
  );
};

export default Login;
