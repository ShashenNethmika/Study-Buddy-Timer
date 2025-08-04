# Study Buddy Timer ⏱📚

A beautifully styled, fully functional **Pomodoro-style timer** designed to help students stay focused while studying. This app includes multiple themes, animated progress rings, fireworks visual effects, and customizable color modes to enhance your productivity experience.

## 🌟 Features

- 🕓 Timer modes: Study, Short Break, Long Break  
- 🎨 Theme switcher with:  
  - Forest Green 🌲  
  - Ocean Blue 🌊  
  - Desert Sunset 🌅  
  - Custom Color Picker 🎨  
- 🔄 Auto-continue to next session  
- 🔔 Soft notification sounds (using [Tone.js](https://tonejs.github.io/))  
- 🎆 Fireworks-style animations on progress  
- 📈 Session counter  
- 🎯 Optimized for focus and minimal distraction  

## 🖼️ UI Preview

> *[Add screenshot or gif of the timer here]*

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/study-buddy-timer.git
cd study-buddy-timer
```

### 2. Open `index.html`

Simply open the `index.html` file in any modern browser (no build tools needed).

---

## 📁 Tech Stack

- HTML5  
- CSS (Tailwind via CDN)  
- JavaScript (Vanilla)  
- Tone.js for sound synthesis  
- Google Fonts (Lato)  

## 💡 How It Works

- Click a mode (e.g., Study) to begin.  
- Use the **Start**, **Pause**, and **Reset** buttons to control the timer.  
- Customize the app appearance with themes or pick your favorite color.  
- Enable **Auto-Continue** to seamlessly switch between sessions.  
- Watch the **animated ring** fill and **particles animate** around the timer.  

---

## 🛠️ Customization

Want to tweak the default times?

In `index.html`, locate the `setTimer(...)` calls:
```js
setTimer(25 * 60, 'Study Focus', ...)
setTimer(5 * 60, 'Short Break', ...)
setTimer(15 * 60, 'Long Break', ...)
```
Change these values to your preferred durations.

---

## 📦 Deployment

You can host this on GitHub Pages:

1. Push this repo to GitHub  
2. Go to **Settings > Pages**  
3. Choose `main` branch and `/root` directory  
4. Visit your link 🎉

---

## 🙌 Contributing

Pull requests are welcome! If you find a bug or have an idea for improvement, feel free to open an issue.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🔗 Credits

- [Tailwind CSS](https://tailwindcss.com/)  
- [Tone.js](https://tonejs.github.io/)  
- [Heroicons](https://heroicons.com/)  
- [Google Fonts - Lato](https://fonts.google.com/specimen/Lato)  

---

## 👨‍💻 Author

Made with 💚 by **[Shashen Nethmika]**
