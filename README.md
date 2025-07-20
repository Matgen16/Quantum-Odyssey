# Quantum Odyssey

Quantum Odyssey is a browser-based platformer game built entirely with HTML, CSS, and JavaScript. In this game, you navigate through a series of uniquely designed levels featuring keys, portals, and obstacles. Each level challenges your timing, precision, and understanding of the mechanics to progress further. The game uses custom SVG assets for the player, keys, portals, and spikes, creating a minimalist yet clear visual style.

This project is structured for simplicity and ease of modification, making it a good foundation for experimenting with platformer mechanics, level design, and browser-based game development. All game logic and levels are contained within standard HTML and JavaScript files without any external frameworks or libraries.

## Running the Program

You can either download the exe and run it yourself or you can compile it yourself.

## Compiling on Windows

> [!IMPORTANT]
> If you want to compile it for yourself you will need to have installed [raylib](https://www.raylib.com/),  [mingw](https://www.mingw-w64.org/), and [git](https://git-scm.com/).

First, you need clone the repository and cd into it using 
```
git clone https://github.com/Matgen16/Quantum-Odyssey.git
cd Quantum-Odyssey
```

Then run 
```
g++ main.cpp -o Quantum-Odyssey.exe -lraylib -lopengl32 -lgdi32 -lwinmm -mwindows
```
to compile it.

Now you can run the file and enjoy.

## Credits

Developed by Matthew Gentle.
All assets are custom-made SVGs included within the project.
