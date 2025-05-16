'use client';
import Image from "next/image";
import WebsiteIcon from "../../public/assets/websiteicon.svg";
import { useSelector } from "react-redux";

const Header = () => {
  const user = useSelector((state) => state.auth.user);
  console.log(user);

  // Extract first letter of name for avatar (fallback to 'U' if no name)
  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  // Display name (fallback to 'User' if no name)
  const displayName = user?.name || 'User';

  // Display email (fallback to empty string if no email)
  const email = user?.email || '';
  return (
    <header className="bg-[#F0F5FB]  p-6 flex justify-between items-center">
      <div></div>
      <div className="flex items-center gap-4">
        {/* Search Input
        <input
          type="text"
          placeholder="Search"
          className="px-4 py-2 border bg-white border border-[#CECECE]  rounded-md focus:outline-none "
        /> */}

        <button className="flex items-center gap-2 px-4 py-2 border border-[#CECECE] rounded-md bg-white hover:bg-gray-100">
          <Image src={WebsiteIcon} alt="Website Icon" width={20} height={20} />
          <span className="text-sm font-medium text-[#565656]">
            View Website
          </span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-500 text-white font-medium">
            {avatarLetter}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">{displayName}</p>
            <p className="text-gray-500 text-xs">{email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
