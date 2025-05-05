import React from "react";
import { NavLink } from "react-router-dom";

const tabs = [
  { name: "Fuel Trucks", path: "/admin/trucks" },
  { name: "Users", path: "/admin/users" },
  { name: "Aircraft", path: "/admin/aircraft" },
  { name: "Customers", path: "/admin/customers" },
  { name: "Roles", path: "/admin/roles" },
];

export default function AdminTabBar() {
  return (
    <div className="w-full flex gap-2 bg-gray-900 dark:bg-gray-900 border-b border-gray-700 px-2 pt-2 pb-0 mb-4">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `px-4 py-2 rounded-t-md font-medium text-sm focus:outline-none transition-colors duration-150
            ${isActive ?
              "bg-gray-800 dark:bg-gray-800 text-blue-400 dark:text-yellow-300 border-b-2 border-blue-400 dark:border-yellow-400" :
              "bg-gray-900 dark:bg-gray-900 text-gray-400 dark:text-gray-400 hover:bg-gray-800 hover:text-blue-300 dark:hover:text-yellow-200"}`
          }
        >
          {tab.name}
        </NavLink>
      ))}
    </div>
  );
}
