/** @format */

import tw, { styled } from "twin.macro";
import { Link } from "react-router-dom";

export const Nav = tw.nav`
    relative flex flex-wrap items-center justify-between px-4 py-5 
    md:px-24 lg:px-8 bg-gray-300
`;
export const InnerNav = tw.div`
    w-full px-4 flex flex-wrap items-center justify-between 
`;
export const InnerMost = tw.div`
    w-full relative flex justify-between lg:w-auto lg:static lg:block 
    lg:justify-start
`;

export const DropDown = styled.div((props: any) => [
  tw`lg:flex flex-grow items-center`,
]);

export const Logo = tw(Link)`
    leading-relaxed inline-block mr-4 whitespace-nowrap 
`;
// export const LogoLink = tw(Link)`
//   leading-relaxed inline-block mr-4 whitespace-nowrap
// `;
export const NavButton = tw.button`
    text-black cursor-pointer text-xl leading-none px-3 py-1 border border-solid 
    border-transparent rounded bg-transparent block lg:hidden outline-none 
    focus:outline-none
`;
export const DropMenu = tw.ul`
    flex flex-col lg:flex-row list-none lg:ml-auto md:w-full md:items-center
    lg:justify-end
`;
export const ListItem = tw.li`
    block
`;
export const InnerItem = tw(Link)`
    px-3 py-2 flex items-center font-sans font-semibold text-lg tracking-wide 
    text-gray-700 hover:text-gray-900 
`;
export const ExtraButton = tw.a`
    text-black bg-transparent border border-solid border-gray-900 
    hover:bg-black hover:text-white active:bg-gray-600 font-sans font-semibold 
    uppercase text-sm px-4 py-2 rounded outline-none focus:outline-none mr-1 
    mb-1 mt-4 lg:mt-0 lg:ml-24
`;
export const Bars = tw.div`
    mt-2
`;
export const Bar = tw.div`
    w-8 h-1 bg-black mb-1 align-middle
`;
