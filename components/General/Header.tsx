import React from "react";

const Header = ({ title, subtext }: HeaderBoxProps) => {
  return (
    <div className="mb-5">
      <h1 className="text-3xl md:text-4xl lg:text-5xl">{title}</h1>
      <p className=" text-mg md:text-lg text-gray-300 pt-2">{subtext}</p>
    </div>
  );
};

export default Header;
