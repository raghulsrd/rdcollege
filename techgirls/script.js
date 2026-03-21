// --- THREE.JS CODE & UTILITIES ---
let scene, camera, renderer, pcModel, controls;
const joystickButton = document.getElementById('joystick-btn');
let isDragging = false;
let startX = 0;
let startY = 0;
const rotationSensitivity = 0.005;
let clock = new THREE.Clock();
const levitationAmplitude = 0.1;
const levitationSpeed = 1;
const initialModelY = -0.7;
let shouldReturn = false;
const returnSpeed = 0.05;
const hamburger = document.getElementById('hamburger-menu');
const mobileMenu = document.getElementById('mobile-menu-links');
const mobileLinks = mobileMenu.querySelectorAll('a'); // <-- This selects all <a> tags inside the mobile menu

// Array to hold ambient animated models
// ...

// Array to hold ambient animated models
const ambientModels = [];

// NEW: Raycaster and mouse variables for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersectedObject = null; // Stores the currently hovered object
const originalEmissives = new Map(); // Store original emissive colors

function toggleMobileMenu() {
    const isActive = mobileMenu.classList.toggle('active');
    hamburger.classList.toggle('active');

    if (isActive) {
        mobileLinks.forEach((link, index) => {
            const delay = index * 0.05;
            link.style.animationDelay = `${delay}s`;
            link.style.opacity = 1;
        });
    } else {
        mobileLinks.forEach(link => {
            link.style.animationDelay = '0s';
            link.style.opacity = 0;
        });
    }
}

// Generic function to load, size, position, and animate secondary models
function loadAndAnimateModel(modelPath, position, scale, rotationSpeed, levitationSpeed, levitationAmplitude) {
    const loader = new THREE.GLTFLoader();
    loader.load(
        modelPath,
        function(gltf) {
            const model = gltf.scene;
            model.position.set(position.x, position.y, position.z);
            model.scale.set(scale, scale, scale);

            model.traverse(function(node) {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    // Store original emissive for glow effect
                    if (node.material) {
                        const materials = Array.isArray(node.material) ? node.material : [node.material];
                        materials.forEach((mat, index) => {
                            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
                                // Store original emissive in a unique key for each mesh and material index
                                const key = `${node.uuid}_${index}`;
                                originalEmissives.set(key, mat.emissive.clone());
                                mat.emissiveIntensity = 1; // Default
                            }
                        });
                    }
                }
            });

            // Store animation parameters on the model object itself
            model.userData = {
                rotationSpeedY: rotationSpeed,
                levitationSpeed: levitationSpeed,
                levitationAmplitude: levitationAmplitude,
                initialY: position.y,
                isInteractive: true // Mark as interactive for raycasting
            };

            ambientModels.push(model);
            scene.add(model);
        },
        undefined,
        function(error) {
            console.error(`Error loading model ${modelPath}:`, error);
        }
    );
}

function init() {
    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);

    const container = document.getElementById('canvas-container');
    container.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x8a2be2, 1, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Floor setup
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- Load MAIN PC model (pc.glb) ---
    const loader = new THREE.GLTFLoader();
    loader.load(
        'pc.glb',
        function(gltf) {
            pcModel = gltf.scene;
            pcModel.scale.set(2, 2, 2);
            pcModel.position.y = initialModelY;
            pcModel.traverse(function(node) {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            scene.add(pcModel);
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
            console.error('Error loading main model:', error);
            createFallbackModel();
        }
    );

    // --- START: Conditional loading for secondary models (Desktop View Only) ---
    if (window.innerWidth > 768) {
        console.log("Loading ambient models for desktop view.");

        // Model 1: Small graphics card on the left front
        loadAndAnimateModel(
            'graphics.glb',
            {x:-1.3, y: 0.7, z: 2.6}, // Position
            0.1,                      // Size/Scale
            0.009,                    // Rotation Speed Y
            0.5,                      // Levitation Speed
            0.05                      // Levitation Amplitude
        );

        // Model 2: Motherboard on the right back
        loadAndAnimateModel(
            'motherboard.glb',
            {x: -10, y: -3, z: -15},
            1.2,
            0.009,
            0.8,
            0.08
        );

        // Model 3: RAM/Component floating high on the left
        loadAndAnimateModel(
            'ram.glb',
            {x: 8, y: 3, z: -10},
            0.5,
            -0.01, // Negative speed for counter-rotation
            1,
            0.1
        );

        // Model 4: Processor/Component on the right front
        loadAndAnimateModel(
            'processor.glb',
            {x: 8, y: -3, z: -10},
            0.7,
            0.008,
            0.6,
            0.03
        );
    } else {
        console.log("Skipping ambient models for mobile view.");
    }
    // --- END: Conditional loading ---

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false;

    window.addEventListener('resize', onWindowResize);

    // Joystick event listeners
    joystickButton.addEventListener('mousedown', startDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('mousemove', drag);
    joystickButton.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchmove', drag, { passive: false });

    hamburger.addEventListener('click', toggleMobileMenu);

    // NEW: Add mousemove listener for hover effects
    window.addEventListener('mousemove', onDocumentMouseMove, false);

    animate();
}

function createFallbackModel() {
    const geometry = new THREE.BoxGeometry(2, 3, 1);
    const material = new THREE.MeshPhongMaterial({
        color: 0x8a2be2,
        shininess: 100,
        specular: 0xffffff
    });
    pcModel = new THREE.Mesh(geometry, material);
    pcModel.castShadow = true;
    pcModel.receiveShadow = true;
    pcModel.position.y = initialModelY;
    scene.add(pcModel);

    const screenGeometry = new THREE.PlaneGeometry(1.5, 1);
    const screenMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        emissive: 0x004444
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.51;
    screen.position.y = 0.5;
    pcModel.add(screen);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    const hexCanvas = document.getElementById('hex-canvas');
    if (hexCanvas) {
        hexCanvas.width = hexCanvas.offsetWidth;
        hexCanvas.height = hexCanvas.offsetHeight;
    }
}

function getCoords(e) {
    return e.touches ? {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
    } : e;
}

function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    shouldReturn = false;
    const { clientX, clientY } = getCoords(e);
    startX = clientX;
    startY = clientY;
}

function endDrag() {
    isDragging = false;
    shouldReturn = true;
}

function drag(e) {
    if (!isDragging || !pcModel) return;
    e.preventDefault();

    const { clientX, clientY } = getCoords(e);

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    pcModel.rotation.y += deltaX * rotationSensitivity;
    pcModel.rotation.x += deltaY * rotationSensitivity;

    startX = clientX;
    startY = clientY;
}

// NEW: Mouse move handler for raycasting
function onDocumentMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (pcModel) {
        // Main PC Levitation Effect
        pcModel.position.y = initialModelY + Math.sin(elapsedTime * levitationSpeed) * levitationAmplitude;

        // Smooth Return Rotation Logic
        if (!isDragging && shouldReturn) {
            pcModel.rotation.x = THREE.MathUtils.lerp(pcModel.rotation.x, 0, returnSpeed);
            pcModel.rotation.y = THREE.MathUtils.lerp(pcModel.rotation.y, 0, returnSpeed);

            if (Math.abs(pcModel.rotation.x) < 0.01 && Math.abs(pcModel.rotation.y) < 0.01) {
                pcModel.rotation.x = 0;
                pcModel.rotation.y = 0;
                shouldReturn = false;
            }
        }
    }

    // Animate Ambient Models (Only if they were loaded)
    ambientModels.forEach(model => {
        // Continuous Rotation
        model.rotation.y += model.userData.rotationSpeedY * deltaTime * 60; // Scale by frame rate

        // Levitation Animation
        const initialY = model.userData.initialY;
        const amp = model.userData.levitationAmplitude;
        const speed = model.userData.levitationSpeed;

        model.position.y = initialY + Math.sin(elapsedTime * speed) * amp;
    });

    // NEW: Raycasting for hover effect
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(ambientModels.flatMap(model => model.children), true);

    if (intersects.length > 0) {
        // Find the top-level ambient model that was intersected
        let hoveredModel = null;
        for (let i = 0; i < intersects.length; i++) {
            let current = intersects[i].object;
            while (current) {
                if (ambientModels.includes(current)) {
                    hoveredModel = current;
                    break;
                }
                current = current.parent;
            }
            if (hoveredModel) break;
        }

        if (hoveredModel && intersectedObject !== hoveredModel) {
            // New object hovered
            if (intersectedObject) {
                // Remove glow from previous object
                intersectedObject.traverse(node => {
                    if (node.isMesh && node.material) {
                        const materials = Array.isArray(node.material) ? node.material : [node.material];
                        materials.forEach((mat, index) => {
                            const key = `${node.uuid}_${index}`;
                            if (originalEmissives.has(key)) {
                                mat.emissive.copy(originalEmissives.get(key));
                                mat.emissiveIntensity = 1; // Reset intensity
                            }
                        });
                    }
                });
            }
            intersectedObject = hoveredModel;
            // Apply subtle gray glow to current object
            intersectedObject.traverse(node => {
                if (node.isMesh && node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    materials.forEach(mat => {
                        if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
                            // --- CHANGE: Subdued Translucent Gray Highlight ---
                            mat.emissive.setHex(0xaaaaaa); // Light gray for the glow color
                            mat.emissiveIntensity = 0.5; // Reduced intensity for subtlety
                            // --------------------------------------------------
                        }
                    });
                }
            });
            document.body.style.cursor = 'pointer';
        }
    } else {
        // No object hovered or mouse moved off the previous object
        if (intersectedObject) {
            // Remove glow from the last hovered object
            intersectedObject.traverse(node => {
                if (node.isMesh && node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    materials.forEach((mat, index) => {
                        const key = `${node.uuid}_${index}`;
                        if (originalEmissives.has(key)) {
                            mat.emissive.copy(originalEmissives.get(key));
                            mat.emissiveIntensity = 1; // Reset intensity
                        }
                    });
                }
            });
            intersectedObject = null;
            document.body.style.cursor = 'default';
        }
    }

    renderer.render(scene, camera);
}

// --- Contact Form Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // In a real application, you would send this data to a server here.
            console.log('Form Submitted!');

            // Show success message
            successMessage.style.display = 'block';

            // Clear form fields
            contactForm.reset();

            // Hide message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        });
    }
});


// --- RECTANGLE BRICK CANVAS FUNCTION (SOLID GAP GLOW) ---
function initializeHexagonCanvas(canvasId, options = {}) {
    if (window.innerWidth <= 768) {
        return;
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const config = {
        rectWidth: 150,
        rectHeight: 75,
        rectSpacing: 0,

        baseFillColor: '#0A0A1A',

        glowSpeed: 0.1,
        hexRepelRadius: 200,
        hexRepelStrength: 60,
        ...options
    };

    const horizDist = config.rectWidth + config.rectSpacing;
    const vertDist = config.rectHeight + config.rectSpacing;

    let cursorPosition = { x: canvas.width / 2, y: canvas.height / 2 };
    let targetCursorPosition = { ...cursorPosition };

    const updateCanvasSize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    };

    const drawBlackBrick = (x, y) => {
        const halfW = config.rectWidth / 2;
        const halfH = config.rectHeight / 2;

        ctx.beginPath();
        ctx.rect(x - halfW, y - halfH, config.rectWidth, config.rectHeight);
        ctx.closePath();
        ctx.fill();
    };

    const drawSolidGlow = () => {
        ctx.globalCompositeOperation = 'source-over';

        const gradient = ctx.createRadialGradient(
            cursorPosition.x, cursorPosition.y, 0,
            cursorPosition.x, cursorPosition.y, config.hexRepelRadius * 2
        );

        gradient.addColorStop(0, `#02F9FE`);
        gradient.addColorStop(0.5, `#8336E4`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cursorPosition.x, cursorPosition.y, config.hexRepelRadius * 2, 0, 2 * Math.PI);
        ctx.fill();
    };


    const drawGrid = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw the Solid Glowing Layer
        drawSolidGlow();

        // 2. Draw and Erase the Bricks
        ctx.fillStyle = config.baseFillColor;
        ctx.globalCompositeOperation = 'destination-out';

        const rows = Math.ceil(canvas.height / vertDist) + 1;
        const cols = Math.ceil(canvas.width / horizDist) + 1;

        const gridWidth = (cols) * horizDist;
        const gridHeight = (rows) * vertDist;

        const xOffsetStart = (canvas.width - gridWidth) / 2;
        const yOffsetStart = (canvas.height - gridHeight) / 2;

        for (let row = 0; row < rows; row++) {
            const isStaggeredRow = row % 2 !== 0;
            const rowOffset = isStaggeredRow ? horizDist / 2 : 0;

            for (let col = 0; col < cols; col++) {

                const centerX = xOffsetStart + col * horizDist + rowOffset + config.rectWidth / 2;
                const centerY = yOffsetStart + row * vertDist + config.rectHeight / 2;

                const dx = centerX - cursorPosition.x;
                const dy = centerY - cursorPosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const repelFactor = Math.max(0, (config.hexRepelRadius - distance) / config.hexRepelRadius);

                const offsetX = dx * repelFactor * config.hexRepelStrength / config.hexRepelRadius;
                const offsetY = dy * repelFactor * config.hexRepelStrength / config.hexRepelRadius;

                drawBlackBrick(centerX + offsetX, centerY + offsetY);
            }
        }

        // Restore default blending mode
        ctx.globalCompositeOperation = 'source-over';
    };

    const animateCursor = () => {
        cursorPosition.x += (targetCursorPosition.x - cursorPosition.x) * config.glowSpeed;
        cursorPosition.y += (targetCursorPosition.y - cursorPosition.y) * config.glowSpeed;
        drawGrid();
        requestAnimationFrame(animateCursor);
    };

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        targetCursorPosition.x = e.clientX - rect.left;
        targetCursorPosition.y = e.clientY - rect.top;
    });

    window.addEventListener('resize', () => {
        updateCanvasSize();
        drawGrid();
    });

    updateCanvasSize();
    drawGrid();
    animateCursor();
}


// Initialize all components when the window loads
window.addEventListener('load', () => {
    init();
    initializeHexagonCanvas('hex-canvas');
});
// Add Image Overlay (Lightbox) Logic
document.addEventListener('DOMContentLoaded', () => {
    // ... existing contact form logic ...
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');

    if (contactForm) {
        // ... contact form submission logic ...
    }
    
    // --- NEW Lightbox Logic ---
    const overlay = document.getElementById('image-overlay');
    const overlayImage = document.getElementById('overlay-image');
    const closeBtn = document.querySelector('.overlay-close-btn');
    const galleryItems = document.querySelectorAll('.gallery-img-link');

    // 1. Open the overlay
    galleryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Find the image element within the clicked item
            const image = item.querySelector('.gallery-img');
            if (image && image.dataset.src) {
                // Set the source of the overlay image to the data-src attribute
                overlayImage.src = image.dataset.src;
                // Add 'active' class to show overlay with fade-in
                overlay.classList.add('active');
            }
        });
    });

    // 2. Close the overlay via button
    closeBtn.addEventListener('click', function() {
        overlay.classList.remove('active');
    });

    // 3. Close the overlay by clicking outside the image
    overlay.addEventListener('click', function(e) {
        // Only close if the click is on the overlay itself, not the content
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });

    // 4. Close the overlay with the ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape" && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
        }
    });
});
// ... rest of your script ...
