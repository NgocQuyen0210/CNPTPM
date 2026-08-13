import "./signUp.css";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import userService from "../../services/userService";

function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!username || !email || !fullName || !password || !confirmPassword) {
      setErrorMsg("Vui lòng điền đầy đủ tất cả các trường!");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      await userService.createUser({
        username,
        email,
        fullName,
        password,
        confirmPassword,
      });
      setSuccessMsg("Đăng ký tài khoản thành công! Đang chuyển hướng đăng nhập...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Lỗi đăng ký tài khoản, vui lòng thử lại!");
    }
  };

  return (
    <div className="signup">
      <div className="dashboard-signup">
        <div className="content-dashboard-signup">
          <h1>Đăng Ký</h1>

          <div className="input-signup">
            <div className="input-signup-field">
              <input 
                type="text" 
                placeholder="Tên đăng nhập" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <FaUser />
            </div>
            <div className="input-signup-field">
              <input 
                type="text" 
                placeholder="Họ và tên" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <FaUser />
            </div>
            <div className="input-signup-field">
              <input 
                type="email" 
                placeholder="Địa chỉ Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FaEnvelope />
            </div>
            <div className="input-signup-field">
              <input 
                type="password" 
                placeholder="Mật khẩu" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FaLock />
            </div>
            <div className="input-signup-field">
              <input 
                type="password" 
                placeholder="Xác nhận mật khẩu" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FaLock />
            </div>
          </div>

          {errorMsg && <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>{errorMsg}</p>}
          {successMsg && <p style={{ color: "green", marginTop: "10px", textAlign: "center" }}>{successMsg}</p>}

          <div className="button-signup">
            <button onClick={handleSignUp}>Tạo Tài Khoản</button>
          </div>

          <div className="have-account">
            <p>
              Đã có tài khoản?{" "}
              <span onClick={() => navigate("/login")}>Đăng nhập</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

