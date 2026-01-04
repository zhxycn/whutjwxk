import { useEffect, useState } from "react";
import {
  login as apiLogin,
  getCaptcha as apiGetCaptcha,
} from "../../services/jwxk";

interface CaptchaResponse {
  uuid: string;
  image_base64: string;
}

interface LoginResponse {
  success: boolean;
  msg: string | null;
  token: string | null;
  student_info: any | null;
}

interface Props {
  addLog: (msg: string) => void;
  onLoginSuccess: (studentInfo: any) => void;
}

export default function LoginForm({ addLog, onLoginSuccess }: Props) {
  const [loginname, setLoginname] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [uuid, setUuid] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = async () => {
    try {
      const res = (await apiGetCaptcha()) as CaptchaResponse;
      setUuid(res.uuid);
      if (res.image_base64.startsWith("data:image")) {
        setCaptchaImg(res.image_base64);
      } else {
        setCaptchaImg(`data:image/png;base64,${res.image_base64}`);
      }
    } catch (e) {
      addLog(`获取验证码失败: ${e}`);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleLogin = async () => {
    if (!loginname || !password || !captcha) {
      addLog("请填写所有字段");
      return;
    }
    setLoading(true);
    try {
      const res = (await apiLogin(
        loginname,
        password,
        captcha,
        uuid
      )) as LoginResponse;
      if (res.success) {
        addLog("登录成功!");
        onLoginSuccess(res.student_info);
      } else {
        addLog(`登录失败: ${res.msg}`);
        fetchCaptcha();
      }
    } catch (e) {
      addLog(`登录错误: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            学号
          </label>
          <input
            className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            value={loginname}
            onChange={(e) => setLoginname(e.target.value)}
            placeholder="请输入学号"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            密码
          </label>
          <input
            type="password"
            className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            验证码
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              placeholder="输入验证码"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {captchaImg && (
              <img
                src={captchaImg}
                alt="Captcha"
                className="h-11 w-32 object-cover cursor-pointer border rounded hover:opacity-80 transition"
                onClick={fetchCaptcha}
                title="点击刷新"
              />
            )}
          </div>
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? "登录中..." : "登 录"}
        </button>
      </div>
    </div>
  );
}
