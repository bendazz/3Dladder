# 3D Circular Japanese Ladder

A 3D visualization of circular permutations using Three.js, extending the concept of Japanese ladders to a cylindrical structure.

## Features

- **3D Cylindrical Visualization**: Rails are arranged in a cylinder, allowing for circular permutations
- **Interactive Rung Controls**: Click to add/remove rungs at different levels and positions
- **Wraparound Connections**: Rungs on the last rail connect to the first rail, creating circular permutations
- **Multiple Animation Modes**: Sequential or simultaneous number movement
- **Adjustable Speed**: Slow, medium, or fast animation speeds
- **3D Camera Controls**: Orbit, zoom, and pan around the ladder
- **Auto-Rotation**: Optional automatic camera rotation for better viewing
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

1. **Rails**: Vertical rails are arranged in a circle, forming a cylindrical structure
2. **Numbers**: Numbered spheres start at the top of each rail
3. **Rungs**: Connect adjacent rails (including wraparound from last to first rail)
4. **Animation**: Numbers move down the rails, crossing rungs when encountered
5. **Circular Permutation**: The final arrangement shows how the numbers have been permuted in a circular fashion

## Controls

- **Numbers**: Select how many rails/numbers to use (3-8)
- **Mode**: Choose sequential (one at a time) or simultaneous animation
- **Speed**: Adjust animation speed (slow/medium/fast)
- **Rung Controls**: Click numbered buttons to add/remove rungs at each level
- **Auto Rotate**: Enable/disable automatic camera rotation
- **Reset**: Clear all rungs and start over

## Mathematical Concept

This visualization demonstrates circular permutations, where the arrangement of elements is considered in a circular fashion. Unlike linear permutations, circular permutations account for the fact that rotating all elements doesn't create a fundamentally different arrangement.

The Japanese ladder method provides an intuitive way to understand how permutations work by visualizing the crossing of elements through the ladder structure.

## Getting Started

1. Open `index.html` in a web browser
2. Use the rung controls on the right to add rungs
3. Press "Start Animation" to see the numbers move
4. Use mouse/touch to rotate and zoom the 3D view

## Technologies Used

- Three.js for 3D graphics
- Vanilla JavaScript for logic and controls
- CSS3 for styling and responsive design
- HTML5 Canvas for number textures