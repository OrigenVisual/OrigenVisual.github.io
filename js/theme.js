document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle")
  const app = document.body

  // Check for saved theme preference or use system preference
  const savedTheme =
    localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")

  // Apply the theme
  if (savedTheme === "dark") {
    app.classList.add("dark-mode")
    updateThemeIcon(true)
  }

  // Toggle theme when button is clicked
  themeToggle.addEventListener("click", () => {
    const isDark = app.classList.toggle("dark-mode")
    localStorage.setItem("theme", isDark ? "dark" : "light")
    updateThemeIcon(isDark)
  })

  function updateThemeIcon(isDark) {
    const icon = themeToggle.querySelector("svg")
    if (isDark) {
      icon.innerHTML =
        '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'
      icon.classList.remove("moon-icon")
      icon.classList.add("sun-icon")
    } else {
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
      icon.classList.remove("sun-icon")
      icon.classList.add("moon-icon")
    }
  }
})
