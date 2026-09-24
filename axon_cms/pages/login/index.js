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
    const { email, password, organization } = values;
    if (!email || !password) {
      message.error("Please fill in all fields");
      return;
    }
    login(email, password, callback, organization);
  };

  const handleDemoLogin = () => {
    login("demouser@headless.com", "Demo@Headless2025", callback);
  };

  const [form] = Form.useForm();

  if (loading) return <Loader />;

  return (
    <div className="fixed inset-0 flex w-full h-screen overflow-hidden bg-white">
      {/* Left — Login form */}
      <div className="relative w-full lg:w-[46%] h-full flex items-start justify-center overflow-y-auto px-6 py-10 md:px-12 bg-white">
        <div className="relative z-10 w-full max-w-[400px] my-auto">
          <div className="mb-10">
            <Image
              src="/images/ui/headless_logo.svg"
              alt="Headless Logo"
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
                name="organization"
                label={
                  <span className="text-slate-700 text-sm font-medium">
                    Organization
                  </span>
                }
                className="mb-4"
              >
                <Input
                  placeholder="Slug or site key (only if the same email is in more than one org)"
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
      <div className="hidden lg:flex relative w-[54%] h-full overflow-hidden bg-slate-700">
        <Image
          src="/images/ui/rrightbg.png"
          alt="Headless CMS workspace"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/45 via-slate-700/30 to-brand/20" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 xl:p-16 z-10 text-center">
          <div className="max-w-md">
            <p className="text-sm font-medium text-white/70 mb-3 tracking-wide">
              Headless CMS
            </p>
            <h2 className="text-3xl xl:text-4xl font-semibold text-white leading-tight tracking-tight mb-4">
              Manage content with clarity and speed
            </h2>
            <p className="text-[15px] text-slate-200/90 leading-relaxed">
              Build pages, organize media, and publish across sites from one
              calm workspace designed for modern teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
