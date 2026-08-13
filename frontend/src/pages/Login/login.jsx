import "./login.css";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import authService from "../../services/authService";
import { useCart } from "../../context/CartContext";

function Login() {
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login({ username, password });
      authService.setSession(response);
      
      // Đồng bộ giỏ hàng ngay lập tức sau khi đăng nhập thành công
      try {
        await fetchCart();
      } catch (cartErr) {
        console.error("Lỗi lấy giỏ hàng sau đăng nhập:", cartErr);
      }
      
      // Chuyển hướng dựa trên Role
      if (authService.isAdmin()) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard/menu");
      }
    } catch (error) {
      setErrorMsg("Sai tài khoản hoặc mật khẩu!");
      console.error(error);
    }
  };

  return (
    <div className="login">
      <div className="dashboard">
        <div className="content-dashboard">
          <h1>Đăng Nhập</h1>

          <div className="input-login">
            <div className="input-login-user">
              <input type="text" className="user" placeholder="Tên đăng nhập" value={username} onChange={e => setUsername(e.target.value)} />
              <FaUser></FaUser>
            </div>
            <div className="input-login-pass">
              <input type="password" className="pass" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} />
              <FaLock></FaLock>
            </div>
          </div>
          {errorMsg && <p style={{color: 'red', marginTop: '10px'}}>{errorMsg}</p>}
          <div className="under-content">
            <div className="check-box">
              <input type="checkbox" />
              <p>Ghi nhớ đăng nhập</p>
            </div>

            <div className="forgot">
              <p>Quên mật khẩu?</p>
            </div>
          </div>
          <div className="button-login">
            <button onClick={handleLogin}>Đăng Nhập</button>
          </div>

          <div className="no-account">
            <p>
              Chưa có tài khoản?{" "}
              <span onClick={() => navigate("/sign-up")}>Đăng ký ngay</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
