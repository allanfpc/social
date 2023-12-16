import { createContext, useState, useEffect, useContext } from "react";

export const ThemeContext = createContext(null);

export default function ThemeContextProvider({ children }) {
	const getPreferredTheme =
		localStorage.getItem("theme") ||
		(window.matchMedia("(prefers-color-scheme: dark)")?.matches && "dark");

	const [theme, setTheme] = useState(getPreferredTheme || "light");
	
	useEffect(() => {
		if (theme === "dark") {
			document.documentElement.setAttribute("data-theme", "dark");
		} else {
			document.documentElement.removeAttribute("data-theme");
		}
	}, [theme]);	

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useThemeContext() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error(
			"useThemeContext must be used within a ThemeContextProvider"
		);
	}

	return context;
}