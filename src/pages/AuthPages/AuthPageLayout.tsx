import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = [
    "/images/sing-fondo/fondo1.jpg",
    "/images/sing-fondo/fondo2.jpg",
    "/images/sing-fondo/fondo3.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div
        className={`relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0 ${className}`}
      >
        {children}
        <div
          className="items-center hidden w-full h-full lg:w-1/2 lg:grid"
          style={{
            backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transition: "background-image 1s ease-in-out",
          }}
        >
          <div className="relative flex items-center justify-center z-1 ">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}

            <div className="flex flex-col items-center max-w-md  bg-white opacity-80 p-4 rounded-lg">
              <Link to="/" className="block">
                <img
                  width={1200}
                  src="/images/logo/sena.svg"
                  alt="Logo"
                />
              </Link>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
