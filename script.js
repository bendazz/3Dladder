class CircularLadder3D {
    constructor() {
        this.rungs = new Set(); // Store active rungs as "level,rail" strings
        this.isAnimating = false;
        this.autoRotating = false;
        this.currentNumberCount = 3;
        this.animationSpeed = 'medium';
        
        // 3D scene properties
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Ladder geometry
        this.cylinderRadius = 3;
        this.ladderHeight = 10;
        this.rungLevels = 5;
        
        // Objects for animation
        this.railMeshes = [];
        this.numberMeshes = [];
        this.rungMeshes = [];
        this.animatedNumbers = [];
        
        this.initializeThreeJS();
        this.initializeEventListeners();
        this.buildLadder3D();
        this.buildRungControls();
        this.updateStatus("Use the rung controls on the right to add rungs, then press Start!");
        
        this.animate();
    }
    
    initializeThreeJS() {
        const container = document.getElementById('threeContainer');
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f8ff);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(8, 5, 8);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        
        // Lighting - increased ambient light for better visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Add additional light from the opposite side
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight2.position.set(-10, 10, -5);
        this.scene.add(directionalLight2);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    onWindowResize() {
        const container = document.getElementById('threeContainer');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    initializeEventListeners() {
        // Number count change listener
        document.getElementById('numberCount').addEventListener('change', (e) => {
            if (!this.isAnimating) {
                this.currentNumberCount = parseInt(e.target.value);
                this.buildLadder3D();
                this.buildRungControls();
                this.hideRunAgainButton();
                this.clearAnimatedNumbers();
                document.getElementById('startButton').disabled = false;
                this.updateStatus("Use the rung controls on the right to add rungs, then press Start!");
            }
        });
        
        // Animation speed change listener
        document.getElementById('animationSpeed').addEventListener('change', (e) => {
            this.animationSpeed = e.target.value;
        });
        
        // Control button listeners
        document.getElementById('startButton').addEventListener('click', () => this.startAnimation());
        document.getElementById('runAgainButton').addEventListener('click', () => this.runAgain());
        document.getElementById('resetButton').addEventListener('click', () => this.reset());
        document.getElementById('rotateButton').addEventListener('click', () => this.toggleAutoRotate());
    }
    
    buildLadder3D() {
        // Clear existing ladder objects
        this.clearLadder3D();
        
        // Build cylindrical rails
        this.buildRails3D();
        
        // Build number circles at the top
        this.buildNumbers3D();
        
        this.updateStatus("Use the rung controls on the right to add rungs, then press Start!");
    }
    
    clearLadder3D() {
        // Remove rails
        this.railMeshes.forEach(mesh => this.scene.remove(mesh));
        this.railMeshes = [];
        
        // Remove numbers
        this.numberMeshes.forEach(mesh => this.scene.remove(mesh));
        this.numberMeshes = [];
        
        // Remove rungs
        this.rungMeshes.forEach(mesh => this.scene.remove(mesh));
        this.rungMeshes = [];
        
        // Clear animated numbers
        this.clearAnimatedNumbers();
    }
    
    clearAnimatedNumbers() {
        this.animatedNumbers.forEach(numberObj => {
            this.scene.remove(numberObj.mesh);
        });
        this.animatedNumbers = [];
    }
    
    buildRails3D() {
        const railMaterial = new THREE.MeshPhongMaterial({ color: 0x4a5568 });
        const railGeometry = new THREE.CylinderGeometry(0.05, 0.05, this.ladderHeight);
        
        for (let i = 0; i < this.currentNumberCount; i++) {
            const angle = (i / this.currentNumberCount) * Math.PI * 2;
            const x = Math.cos(angle) * this.cylinderRadius;
            const z = Math.sin(angle) * this.cylinderRadius;
            
            const rail = new THREE.Mesh(railGeometry, railMaterial);
            rail.position.set(x, 0, z);
            rail.castShadow = true;
            rail.receiveShadow = true;
            
            this.scene.add(rail);
            this.railMeshes.push(rail);
        }
    }
    
    buildNumbers3D() {
        for (let i = 0; i < this.currentNumberCount; i++) {
            const angle = (i / this.currentNumberCount) * Math.PI * 2;
            const x = Math.cos(angle) * this.cylinderRadius;
            const z = Math.sin(angle) * this.cylinderRadius;
            
            // Create number sphere positioned above the rails - using blue with proper 3D shading
            const geometry = new THREE.SphereGeometry(0.35, 32, 32);
            const material = new THREE.MeshPhongMaterial({ 
                color: 0x4299e1,
                shininess: 100,
                specular: 0x222222
            });
            const numberMesh = new THREE.Mesh(geometry, material);
            
            // Position closer to the rails for blue spheres
            numberMesh.position.set(x, this.ladderHeight / 2 + 0.6, z);
            numberMesh.castShadow = true;
            numberMesh.receiveShadow = true;
            
            // Add text
            this.addNumberText(numberMesh, i + 1, x, this.ladderHeight / 2 + 0.6, z);
            
            this.scene.add(numberMesh);
            this.numberMeshes.push(numberMesh);
        }
    }
    
    addNumberText(parentMesh, number, x, y, z) {
        // Create a simple text sprite with transparent background
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;
        
        // Clear canvas with transparent background
        context.clearRect(0, 0, 256, 256);
        
        // Skip the black background circle - let the sphere color show through
        
        // Add white text with black outline for visibility
        context.fillStyle = '#ffffff';
        context.strokeStyle = '#000000';
        context.lineWidth = 8;
        context.font = 'bold 120px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Draw text outline first
        context.strokeText(number.toString(), 128, 128);
        // Then fill text
        context.fillText(number.toString(), 128, 128);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            alphaTest: 0.01,
            depthTest: false,
            depthWrite: false
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.8, 0.8, 1);  // Smaller and more proportional
        sprite.position.set(0, 0, 0);
        sprite.renderOrder = 1000; // Render on top
        
        parentMesh.add(sprite);
    }
    
    buildRungControls() {
        const container = document.getElementById('rungControlsContainer');
        container.innerHTML = '';
        
        for (let level = 0; level < this.rungLevels; level++) {
            const levelDiv = document.createElement('div');
            levelDiv.className = 'rung-level';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'rung-level-title';
            titleDiv.textContent = `Level ${level + 1}`;
            levelDiv.appendChild(titleDiv);
            
            const togglesDiv = document.createElement('div');
            togglesDiv.className = 'rung-toggles';
            
            for (let rail = 0; rail < this.currentNumberCount; rail++) {
                const toggle = document.createElement('div');
                toggle.className = 'rung-toggle';
                toggle.textContent = rail + 1;
                toggle.setAttribute('data-position', `${level},${rail}`);
                toggle.addEventListener('click', (e) => this.toggleRung(e));
                
                togglesDiv.appendChild(toggle);
            }
            
            levelDiv.appendChild(togglesDiv);
            container.appendChild(levelDiv);
        }
    }
    
    toggleRung(event) {
        if (this.isAnimating) return;
        
        const toggle = event.target;
        const position = toggle.getAttribute('data-position');
        const [level, rail] = position.split(',').map(Number);
        const rungKey = `${level},${rail}`;
        
        if (this.rungs.has(rungKey)) {
            // Remove rung
            this.rungs.delete(rungKey);
            toggle.classList.remove('active');
            this.removeRung3D(level, rail);
        } else {
            // First, remove any existing rung at this level (Japanese ladder rule: one rung per level)
            const existingRungAtLevel = Array.from(this.rungs).find(rung => {
                const [existingLevel] = rung.split(',').map(Number);
                return existingLevel === level;
            });
            
            if (existingRungAtLevel) {
                const [existingLevel, existingRail] = existingRungAtLevel.split(',').map(Number);
                this.rungs.delete(existingRungAtLevel);
                this.removeRung3D(existingLevel, existingRail);
                
                // Remove active class from the previous toggle
                const previousToggle = document.querySelector(`[data-position="${existingLevel},${existingRail}"]`);
                if (previousToggle) {
                    previousToggle.classList.remove('active');
                }
            }
            
            // Add new rung
            this.rungs.add(rungKey);
            toggle.classList.add('active');
            this.addRung3D(level, rail);
        }
        
        this.hideRunAgainButton();
        this.updateRungCount();
    }
    
    addRung3D(level, rail) {
        const y = this.ladderHeight / 2 - (level + 1) * (this.ladderHeight / (this.rungLevels + 1));
        
        // Calculate positions for current rail and next rail (with wraparound)
        const angle1 = (rail / this.currentNumberCount) * Math.PI * 2;
        const angle2 = ((rail + 1) % this.currentNumberCount / this.currentNumberCount) * Math.PI * 2;
        
        const x1 = Math.cos(angle1) * this.cylinderRadius;
        const z1 = Math.sin(angle1) * this.cylinderRadius;
        const x2 = Math.cos(angle2) * this.cylinderRadius;
        const z2 = Math.sin(angle2) * this.cylinderRadius;
        
        // Create rung as a curved line between rails following the cylinder surface
        // Instead of going through the center, follow the outer surface of the cylinder
        const startAngle = (rail / this.currentNumberCount) * Math.PI * 2;
        const endAngle = ((rail + 1) % this.currentNumberCount / this.currentNumberCount) * Math.PI * 2;
        
        // Handle wraparound case to always take the shortest path
        let angleDiff = endAngle - startAngle;
        if (angleDiff <= 0) angleDiff += 2 * Math.PI; // Ensure positive direction for adjacent rails
        
        // Create points along the cylindrical surface
        const surfacePoints = [];
        const numPoints = 20;
        
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const angle = startAngle + angleDiff * t;
            const x = Math.cos(angle) * this.cylinderRadius;
            const z = Math.sin(angle) * this.cylinderRadius;
            surfacePoints.push(new THREE.Vector3(x, y, z));
        }
        
        const curve = new THREE.CatmullRomCurve3(surfacePoints);
        
        console.log(`Creating rung at level ${level}, rail ${rail} to ${(rail + 1) % this.currentNumberCount} with angle diff ${angleDiff}`);
        
        const points = curve.getPoints(20);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x48bb78, 
            linewidth: 4 
        });
        
        // For better visibility, use tube geometry instead of line
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
        const tubeMaterial = new THREE.MeshPhongMaterial({ color: 0x48bb78 });
        
        const rung = new THREE.Mesh(tubeGeometry, tubeMaterial);
        rung.castShadow = true;
        rung.receiveShadow = true;
        rung.userData = { level, rail };
        
        this.scene.add(rung);
        this.rungMeshes.push(rung);
    }
    
    removeRung3D(level, rail) {
        const rungIndex = this.rungMeshes.findIndex(rung => 
            rung.userData.level === level && rung.userData.rail === rail
        );
        
        if (rungIndex !== -1) {
            const rung = this.rungMeshes[rungIndex];
            this.scene.remove(rung);
            this.rungMeshes.splice(rungIndex, 1);
        }
    }
    
    updateRungCount() {
        const count = this.rungs.size;
        if (count === 0) {
            this.updateStatus("Use the rung controls on the right to add rungs, then press Start!");
        } else {
            this.updateStatus(`${count} rung${count !== 1 ? 's' : ''} added. Ready to start!`);
        }
    }
    
    async startAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        document.getElementById('startButton').disabled = true;
        
        const animationMode = document.querySelector('input[name="animationMode"]:checked').value;
        this.updateStatus(`Animation in progress (${animationMode})...`);
        
        // Create animated number objects
        this.createAnimatedNumbers();
        
        if (animationMode === 'simultaneous') {
            await Promise.all(this.animatedNumbers.map(numberObj => this.animateNumber(numberObj)));
        } else {
            for (let i = 0; i < this.animatedNumbers.length; i++) {
                await this.animateNumber(this.animatedNumbers[i]);
                await this.delay(this.getSpeedDelay());
            }
        }
        
        this.showFinalResult();
        
        this.isAnimating = false;
        document.getElementById('startButton').disabled = false;
        this.showRunAgainButton();
        this.updateStatus("Animation complete! Click Run Again to replay or Reset to change rungs.");
    }
    
    createAnimatedNumbers() {
        this.clearAnimatedNumbers();
        
        for (let i = 0; i < this.currentNumberCount; i++) {
            const angle = (i / this.currentNumberCount) * Math.PI * 2;
            const x = Math.cos(angle) * this.cylinderRadius;
            const z = Math.sin(angle) * this.cylinderRadius;
            
            // Create animated number sphere - using red with proper 3D shading
            const geometry = new THREE.SphereGeometry(0.3, 32, 32);
            const material = new THREE.MeshPhongMaterial({ 
                color: 0xe53e3e,
                shininess: 100,
                specular: 0x222222
            });
            const numberMesh = new THREE.Mesh(geometry, material);
            
            // Position to match the blue spheres' starting position
            numberMesh.position.set(x, this.ladderHeight / 2 + 0.6, z);
            numberMesh.castShadow = true;
            numberMesh.receiveShadow = true;
            
            // Add text
            this.addNumberText(numberMesh, i + 1, x, this.ladderHeight / 2 + 0.6, z);
            
            this.scene.add(numberMesh);
            
            this.animatedNumbers.push({
                mesh: numberMesh,
                currentRail: i,
                currentY: this.ladderHeight / 2 + 0.6
            });
        }
    }
    
    async animateNumber(numberObj) {
        let currentRail = numberObj.currentRail;
        let currentPosition = currentRail;
        
        // Find all rungs that this number will encounter and sort by level
        const encounterPoints = [];
        
        for (let level = 0; level < this.rungLevels; level++) {
            const rungFromCurrentRail = `${level},${currentPosition}`;
            const rungToCurrentRail = `${level},${(currentPosition - 1 + this.currentNumberCount) % this.currentNumberCount}`;
            
            if (this.rungs.has(rungFromCurrentRail)) {
                // There's a rung starting from our current rail, going clockwise
                const nextRail = (currentPosition + 1) % this.currentNumberCount;
                const y = this.ladderHeight / 2 - (level + 1) * (this.ladderHeight / (this.rungLevels + 1));
                
                encounterPoints.push({
                    level,
                    y,
                    fromRail: currentPosition,
                    toRail: nextRail,
                    direction: 'clockwise'
                });
                
                currentPosition = nextRail;
            } else if (this.rungs.has(rungToCurrentRail)) {
                // There's a rung ending at our current rail, coming from counter-clockwise
                const prevRail = (currentPosition - 1 + this.currentNumberCount) % this.currentNumberCount;
                const y = this.ladderHeight / 2 - (level + 1) * (this.ladderHeight / (this.rungLevels + 1));
                
                encounterPoints.push({
                    level,
                    y,
                    fromRail: currentPosition,
                    toRail: prevRail,
                    direction: 'counter-clockwise'
                });
                
                currentPosition = prevRail;
            }
        }
        
        // If no rungs, just move smoothly to the bottom
        if (encounterPoints.length === 0) {
            const finalAngle = (currentPosition / this.currentNumberCount) * Math.PI * 2;
            const finalX = Math.cos(finalAngle) * this.cylinderRadius;
            const finalZ = Math.sin(finalAngle) * this.cylinderRadius;
            await this.moveNumberTo(numberObj, finalX, -this.ladderHeight / 2 - 0.5, finalZ);
            return currentPosition;
        }
        
        // Animate through each encounter point
        for (let i = 0; i < encounterPoints.length; i++) {
            const encounter = encounterPoints[i];
            
            // Move down to the rung level on current rail
            const fromAngle = (encounter.fromRail / this.currentNumberCount) * Math.PI * 2;
            const fromX = Math.cos(fromAngle) * this.cylinderRadius;
            const fromZ = Math.sin(fromAngle) * this.cylinderRadius;
            await this.moveNumberTo(numberObj, fromX, encounter.y, fromZ);
            
            // Cross the rung
            const toAngle = (encounter.toRail / this.currentNumberCount) * Math.PI * 2;
            const toX = Math.cos(toAngle) * this.cylinderRadius;
            const toZ = Math.sin(toAngle) * this.cylinderRadius;
            
            if (encounter.direction === 'clockwise') {
                await this.moveNumberAlongRungWithRails(numberObj, encounter.fromRail, encounter.toRail, encounter.y);
            } else {
                await this.moveNumberAlongRungReverseWithRails(numberObj, encounter.fromRail, encounter.toRail, encounter.y);
            }
        }
        
        // Move to final position below the bottom rail
        const finalAngle = (currentPosition / this.currentNumberCount) * Math.PI * 2;
        const finalX = Math.cos(finalAngle) * this.cylinderRadius;
        const finalZ = Math.sin(finalAngle) * this.cylinderRadius;
        await this.moveNumberTo(numberObj, finalX, -this.ladderHeight / 2 - 0.5, finalZ);
        
        return currentPosition;
    }
    
    async moveNumberTo(numberObj, targetX, targetY, targetZ) {
        return new Promise(resolve => {
            const startX = numberObj.mesh.position.x;
            const startY = numberObj.mesh.position.y;
            const startZ = numberObj.mesh.position.z;
            const duration = this.getAnimationDuration();
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeInOut = progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                const currentX = startX + (targetX - startX) * easeInOut;
                const currentY = startY + (targetY - startY) * easeInOut;
                const currentZ = startZ + (targetZ - startZ) * easeInOut;
                
                numberObj.mesh.position.set(currentX, currentY, currentZ);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
    
    async moveNumberAlongRung(numberObj, fromX, fromY, fromZ, toX, toY, toZ) {
        return new Promise(resolve => {
            // Calculate angles from the actual coordinates
            const startAngle = Math.atan2(fromZ, fromX);
            const endAngle = Math.atan2(toZ, toX);
            
            // Calculate the shortest angular path (clockwise direction for adjacent rails)
            let angleDiff = endAngle - startAngle;
            
            // For adjacent rails, the angle difference should be small
            // Force clockwise direction for normal rung traversal
            if (angleDiff < 0) angleDiff += 2 * Math.PI;
            if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            
            const surfacePoints = [];
            const numPoints = 20;
            
            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints;
                const angle = startAngle + angleDiff * t;
                const x = Math.cos(angle) * this.cylinderRadius;
                const z = Math.sin(angle) * this.cylinderRadius;
                surfacePoints.push(new THREE.Vector3(x, fromY, z));
            }
            
            const curve = new THREE.CatmullRomCurve3(surfacePoints);
            
            const duration = this.getAnimationDuration();
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeInOut = progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                // Get position along the curve
                const position = curve.getPoint(easeInOut);
                numberObj.mesh.position.copy(position);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
    
    async moveNumberAlongRungWithRails(numberObj, fromRail, toRail, y) {
        return new Promise(resolve => {
            // Use rail indices directly for reliable angle calculation
            const startAngle = (fromRail / this.currentNumberCount) * Math.PI * 2;
            const endAngle = (toRail / this.currentNumberCount) * Math.PI * 2;
            
            // For clockwise movement, ensure we take the short path (especially for wraparound)
            let angleDiff = endAngle - startAngle;
            if (angleDiff <= 0) angleDiff += 2 * Math.PI; // Handle wraparound case
            if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI; // Take shorter path if needed
            
            const surfacePoints = [];
            const numPoints = 20;
            
            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints;
                const angle = startAngle + angleDiff * t;
                const x = Math.cos(angle) * this.cylinderRadius;
                const z = Math.sin(angle) * this.cylinderRadius;
                surfacePoints.push(new THREE.Vector3(x, y, z));
            }
            
            const curve = new THREE.CatmullRomCurve3(surfacePoints);
            
            const duration = this.getAnimationDuration();
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeInOut = progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                // Get position along the curve
                const position = curve.getPoint(easeInOut);
                numberObj.mesh.position.copy(position);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
    
    async moveNumberAlongRungReverseWithRails(numberObj, fromRail, toRail, y) {
        return new Promise(resolve => {
            // Use rail indices directly for reliable angle calculation
            const startAngle = (fromRail / this.currentNumberCount) * Math.PI * 2;
            const endAngle = (toRail / this.currentNumberCount) * Math.PI * 2;
            
            // For counter-clockwise movement, take the longer path around
            let angleDiff = endAngle - startAngle;
            if (angleDiff >= 0) angleDiff -= 2 * Math.PI; // Force negative (counter-clockwise)
            if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI; // But don't go too far
            
            const surfacePoints = [];
            const numPoints = 20;
            
            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints;
                const angle = startAngle + angleDiff * t;
                const x = Math.cos(angle) * this.cylinderRadius;
                const z = Math.sin(angle) * this.cylinderRadius;
                surfacePoints.push(new THREE.Vector3(x, y, z));
            }
            
            const curve = new THREE.CatmullRomCurve3(surfacePoints);
            
            const duration = this.getAnimationDuration();
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeInOut = progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                // Get position along the curve
                const position = curve.getPoint(easeInOut);
                numberObj.mesh.position.copy(position);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
    
    getAnimationDuration() {
        const speeds = {
            slow: 1200,
            medium: 800,
            fast: 400
        };
        return speeds[this.animationSpeed] || speeds.medium;
    }
    
    getSpeedDelay() {
        const delays = {
            slow: 800,
            medium: 500,
            fast: 200
        };
        return delays[this.animationSpeed] || delays.medium;
    }
    
    showFinalResult() {
        const finalPositions = this.animatedNumbers.map((numberObj, index) => {
            // Find which rail this position corresponds to
            let finalRail = 0;
            let minDistance = Infinity;
            
            for (let i = 0; i < this.currentNumberCount; i++) {
                const angle = (i / this.currentNumberCount) * Math.PI * 2;
                const railX = Math.cos(angle) * this.cylinderRadius;
                const railZ = Math.sin(angle) * this.cylinderRadius;
                
                const distance = Math.sqrt(
                    Math.pow(numberObj.mesh.position.x - railX, 2) +
                    Math.pow(numberObj.mesh.position.z - railZ, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    finalRail = i;
                }
            }
            
            return { original: index + 1, final: finalRail };
        });
        
        const permutation = finalPositions
            .sort((a, b) => a.final - b.final)
            .map(pos => pos.original);
        
        this.updateStatus(`Final circular permutation: [${permutation.join(', ')}]`);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showRunAgainButton() {
        document.getElementById('startButton').style.display = 'none';
        document.getElementById('runAgainButton').style.display = 'inline-block';
    }
    
    hideRunAgainButton() {
        document.getElementById('startButton').style.display = 'inline-block';
        document.getElementById('runAgainButton').style.display = 'none';
    }
    
    async runAgain() {
        this.clearAnimatedNumbers();
        await this.startAnimation();
    }
    
    reset() {
        if (this.isAnimating) return;
        
        // Clear animated numbers
        this.clearAnimatedNumbers();
        
        // Clear all rungs
        this.rungs.clear();
        document.querySelectorAll('.rung-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
        
        // Remove rung meshes
        this.rungMeshes.forEach(mesh => this.scene.remove(mesh));
        this.rungMeshes = [];
        
        // Reset button state
        document.getElementById('startButton').disabled = false;
        this.hideRunAgainButton();
        
        this.updateStatus("Use the rung controls on the right to add rungs, then press Start!");
    }
    
    toggleAutoRotate() {
        this.autoRotating = !this.autoRotating;
        const button = document.getElementById('rotateButton');
        
        if (this.autoRotating) {
            button.textContent = 'Stop Rotate';
            button.classList.add('active');
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 0.5;
        } else {
            button.textContent = 'Auto Rotate';
            button.classList.remove('active');
            this.controls.autoRotate = false;
        }
    }
    
    updateStatus(message) {
        document.getElementById('statusText').textContent = message;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CircularLadder3D();
});
