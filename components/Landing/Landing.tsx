import { SignInButton } from "@clerk/nextjs";
import CustomButton from "../General/CustomButton";
import Image from "next/image";
import BrowserCard from "../General/BrowserCard";
import { Spotlight } from "../ui/spotlight";
import LoadingIntro from "./LoadingIntro";

const Landing = () => {
  return (
    <div className="relative z-0">
      <Spotlight
        className=" blur-xl from-red-900 via-red-500 to-red-900"
        size={64}
      />
      <div className="absolute inset-0">
        <svg className="h-full w-full">
          <defs>
            <pattern
              id="grid-pattern"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                xmlns="http://www.w3.org/2000/svg"
                d="M0 4H4M4 4V0M4 4H8M4 4V8"
                stroke="currentColor"
                strokeOpacity="0.3"
                className="stroke-white dark:stroke-black"
              />
              <rect
                x="3"
                y="3"
                width="2"
                height="2"
                fill="currentColor"
                fillOpacity="0.25"
                className="fill-white dark:fill-black"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>
      <div className="relative h-screen flex flex-col justify-center items-center mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8 overflow-hidden z-20">
        {/* Background Image */}
        <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 w-[95%] h-[50%] brightness-75 hover:brightness-100 transition duration-300 z-10">
          <BrowserCard
            imageSrc="/images/dashboard.webp" // Ensure this path is correct
            altText="Webpage Content"
          />
        </div>
        <div className="flex items-center">
          <div className="relative h-10 w-10">
            <Image
              src="/images/logo.svg"
              alt="logo"
              fill
              style={{
                objectFit: "cover",
              }}
            />
          </div>
          <span className="font-editorial text-lg">PamPamPay</span>
        </div>
        <div className="mb-40">
          <div className="space-y-2">
            <LoadingIntro />
          </div>

          <div className="flex space-x-4 mt-6 w-full mx-auto justify-center relative z-10">
            <SignInButton>
              <CustomButton>Register</CustomButton>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;