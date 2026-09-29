// pages/login.js

import { Button, Form, Input, message } from "antd";
import Image from "next/image";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useAuth } from "../../src/context/AuthContext";
import Loader from "../../components/Loader";

export default function Login() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const { callback } = router.query;

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO === "true";

  const handleLogin = (values) => {
    const { email, password } = values;
    if (!email || !password) {
      message.error("Please fill in all fields");
      return;
    }
    login(email, password, callback);
  };

  const handleDemoLogin = () => {
    login("demouser@headless.com", "Demo@Headless2025", callback);
  };

  const [form] = Form.useForm();

  if (loading) return <Loader />;

  return (
    <div className="fixed inset-0 flex w-full h-screen overflow-hidden bg-white">
      {/* Left — Login form */}
      <div className="relative flex h-full w-full items-start justify-center overflow-y-auto bg-white px-4 py-8 pb-24 sm:px-6 md:px-12 lg:w-1/2">
        <div className="relative z-10 w-full max-w-[400px] my-auto">
          <div className="mb-10 flex items-center justify-center">
            <Image
              src="/images/ui/headless_logo.svg"
              alt="Axon Logo"
              width={180}
              height={44}
              priority
            />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl md:text-[28px] font-semibold text-slate-800 tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-slate-500 text-[15px] leading-relaxed">
              Sign in to continue to your dashboard
            </p>
          </div>

          {isDemoMode ? (
            <Button
              block
              type="primary"
              className="h-11 text-[15px] font-semibold rounded-lg shadow-none"
              onClick={handleDemoLogin}
            >
              Get In
            </Button>
          ) : (
            <Form
              form={form}
              name="login"
              layout="vertical"
              requiredMark={false}
              initialValues={{
                remember: true,
                email: "",
                password: "",
              }}
              onFinish={handleLogin}
            >
              <Form.Item
                name="email"
                label={
                  <span className="text-slate-700 text-sm font-medium">
                    Email
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Please input your email!",
                  },
                ]}
                className="mb-4"
              >
                <Input
                  prefix={
                    <MailOutlined className="text-base text-slate-400 mr-1" />
                  }
                  placeholder="you@company.com"
                  size="large"
                  className="h-11 rounded-lg border-slate-200 hover:border-slate-300"
                />
              </Form.Item>
              <Form.Item
                name="password"
                label={
                  <span className="text-slate-700 text-sm font-medium">
                    Password
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
                className="mb-6"
              >
                <Input.Password
                  placeholder="Enter your password"
                  size="large"
                  className="h-11 rounded-lg border-slate-200 hover:border-slate-300"
                  prefix={
                    <LockOutlined className="text-base text-slate-400 mr-1" />
                  }
                  iconRender={(visible) =>
                    visible ? (
                      <EyeOutlined className="text-slate-400" />
                    ) : (
                      <EyeInvisibleOutlined className="text-slate-400" />
                    )
                  }
                />
              </Form.Item>
              <Form.Item className="mb-0">
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  className="h-11 text-[15px] font-semibold rounded-lg shadow-none"
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      </div>

      {/* Right — Visual panel */}
      <div className="hidden lg:flex relative w-1/2 h-full overflow-hidden bg-[#c5def7]">
        <Image
          src="/images/ui/rrightbg.png"
          alt="Axon workspace"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          priority
          className="opacity-[0.22] mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand/55 via-brand-dark/45 to-brand-dark/60" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 xl:p-16 z-10 text-center">
          <div className="max-w-md">
            <h2 className="text-3xl xl:text-4xl font-semibold text-black leading-tight tracking-tight mb-4">
              Manage content with clarity and speed
            </h2>
            <p className="text-[15px] text-black leading-relaxed">
              Build pages, organize media, and publish across sites from one
              calm workspace designed for modern teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
