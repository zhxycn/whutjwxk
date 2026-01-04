import { useEffect, useState } from "react";
import { checkSession as apiCheckSession } from "../services/jwxk";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";

interface LoginResponse {
  success: boolean;
  msg: string | null;
  token: string | null;
  student_info: any | null;
}

export default function SessionManager() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any | null>(null);

  const addLog = (msg: string) => {
    console.log(msg);
  };

  useEffect(() => {
    const check = async () => {
      try {
        const res = (await apiCheckSession()) as LoginResponse;
        if (res.success && res.student_info) {
          addLog("Session restored.");
          setIsLoggedIn(true);
          setStudentInfo(res.student_info);
        }
      } catch (e) {
        console.log("Check session failed", e);
      }
    };
    check();
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 p-4 font-sans text-gray-800 text-sm flex flex-col">
      <div className="max-w-7xl w-full mx-auto flex-1 min-h-0 flex flex-col">
        {!isLoggedIn ? (
          <div className="flex-1 flex items-center justify-center">
            <LoginForm
              addLog={addLog}
              onLoginSuccess={(si) => {
                setIsLoggedIn(true);
                setStudentInfo(si);
              }}
            />
          </div>
        ) : (
          <Dashboard studentInfo={studentInfo} />
        )}
      </div>
    </div>
  );
}
