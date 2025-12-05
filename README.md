🗺️ SmartRoute: Shortest Path Finder & Travel Time Estimator

SmartRoute is an interactive web application that visualizes the shortest path algorithm on real-world maps. Built with JavaScript, Leaflet.js, and D3.js, it allows users to plot nodes on a map, connect them with paths, and calculate the most efficient route using Dijkstra's Algorithm.

Unlike simple distance calculators, SmartRoute provides real-world context by estimating travel times for different modes of transport (Walking, Cycling, Motorbike, and Car) based on the calculated distance.

  Live Demo: Click here to try it out!
🔗 https://github.com/yourusername/SmartRoute-Project.git


🚀 Key Features

Interactive Map Interface: Uses Leaflet.js to render real-world maps (OpenStreetMap), allowing users to zoom, pan, and explore specific locations.

Dynamic Graph Creation:

Add Nodes: Simply click anywhere on the map to create a new intersection (node).

Create Paths: Right-click on a "Source" node and then right-click on a "Target" node to draw a connection path between them.

Algorithmic Routing: Implements Dijkstra's Algorithm from scratch to find the mathematically shortest path between any two points in the network.

Real-World Distances: Uses the Haversine Formula to calculate precise distances between GPS coordinates (Latitude/Longitude) in meters/kilometers.

Travel Time Estimation: Automatically calculates Estimated Time of Arrival (ETA) for:

🏃 Walking (5 km/h)

🚲 Bicycle (15 km/h)

🛵 Motorbike/Scooter (30 km/h)

🚗 Car (40 km/h)

Data Persistence: Supports Importing and Exporting map data (JSON format), allowing users to save their custom networks and reload them later.

🛠️ Technologies Used

Frontend Framework: HTML5, CSS3, Bootstrap 4 (for responsive design and UI components).

Scripting Language: JavaScript (ES6).

Map Rendering: Leaflet.js (Open-source JavaScript library for mobile-friendly interactive maps).

Data Visualization: D3.js (Data-Driven Documents) for rendering SVG nodes and dynamic path lines on top of the map.

DOM Manipulation: jQuery.

Icons: FontAwesome (for vehicle and interface icons).

📖 How to Use

Navigate: Use the search inputs or drag the map to your desired location (e.g., your city or neighborhood).

Plot Nodes: Click on the map to place Nodes (blue circles) at intersections or key landmarks.

Connect Paths:

Right-click on the first node (it will turn yellow to indicate selection).

Right-click on a second node to connect them. A dashed line will appear, representing a road.

Find Route:

Select a "From" node and a "To" node from the dropdown menus on the left.

Click the "Start Route" button.

View Results:

The shortest path will be highlighted in magenta.

The Results Card will display the total distance and estimated travel times for walking, biking, and driving.

📥 Installation & Setup

Since this project is built with vanilla JavaScript and HTML, you don't need to install any complex dependencies like Node.js or Python.

https://github.com/yourusername/SmartRoute-Project.git


Open the project:
Navigate to the project folder and simply double-click index.html to open it in your web browser.

🤝 Contributing

Contributions, issues, and feature requests are welcome!

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License

Distributed under the MIT License. See LICENSE for more information.

Created by [Amit Nautiyal]- MCA 2024-26
Graphic Era Hill University Dehradun
