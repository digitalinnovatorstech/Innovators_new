"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import InnovatorsImage from "../../public/assets/innovators.svg";
import DashboardIcon from "../../public/assets/dashboardicon.svg";
import HeroManagementIcon from "../../public/assets/heroicon.svg";
import BlogsIcon from "../../public/assets/blogicon.svg";
import CareersIcon from "../../public/assets/careericon.svg";
import SettingsIcon from "../../public/assets/settingsicon.svg";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
    disabled: false,
  },
  {
    name: "Hero Management",
    href: "/heromanagement",
    icon: HeroManagementIcon,
  },
  { name: "Blog", href: "/blogs", icon: BlogsIcon },
  { name: "Careers", href: "/careers", icon: CareersIcon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
  { name: "General Talk", href: "/generaltalk", icon: CareersIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-[#F0F5FB] ">
      <div className="p-4 h-16 ">
        <Image src={InnovatorsImage} alt="logo" width={150} height={150} />
      </div>
      <nav className="flex-1 px-4 py-4 mt-10 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return item.disabled ? (
            <div
              key={item.name}
              className="group flex items-center px-4 py-3 text-sm font-semibold rounded-md transition-colors duration-200 cursor-not-allowed text-gray-400 bg-gray-100"
            >
              <div className="relative w-5 h-5 mr-2">
                <Image
                  src={item.icon}
                  alt={`${item.name} icon`}
                  width={20}
                  height={20}
                  className="opacity-50"
                />
              </div>

              <span className=" text-primary">|</span>

              <span className="ml-2">{item.name} </span>
            </div>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-md transition-colors duration-200 ${isActive
                ? "bg-blue-100 text-[#2196F3]"
                : " hover:text-[#2196F3] hover:bg-gray-100"
                }`}
            >
              <div className="relative w-5 h-5 mr-2">
                <div
                  className={`absolute inset-0 transition-opacity duration-200 ${isActive ? "opacity-0" : "group-hover:opacity-0"
                    }`}
                >
                  <Image
                    src={item.icon}
                    alt={`${item.name} icon`}
                    width={20}
                    height={20}
                  />
                </div>

                <div
                  className={`absolute inset-0 transition-opacity duration-200 ${isActive
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                    }`}
                >
                  <Image
                    src={item.icon}
                    alt={`${item.name} icon active`}
                    width={20}
                    height={20}
                    className="filter-[#2196F3]"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(48%) sepia(85%) saturate(2151%) hue-rotate(190deg) brightness(97%) contrast(91%)",
                    }}
                  />
                </div>
              </div>

              <span className=" text-primary">|</span>

              <span className="ml-2">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
