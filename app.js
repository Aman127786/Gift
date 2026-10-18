
        /* ==========================================================================
           1. STRICT MOUSE-TILT PARALLAX 3D PORTRAIT LOGIC
           ========================================================================== */
        const cardStage = document.getElementById('card-stage');
        const card3D = document.getElementById('card-3d');
        const holoGlare = document.getElementById('holo-glare');

        function handleCardMove(clientX, clientY) {
            const rect = cardStage.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation (-18deg to +18deg)
            const rotateX = ((y - centerY) / centerY) * -16;
            const rotateY = ((x - centerX) / centerX) * 18;

            card3D.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;

            // Update holographic glare coordinates
            const glareX = (x / rect.width) * 100;
            const glareY = (y / rect.height) * 100;
            holoGlare.style.setProperty('--glare-x', `${glareX}%`);
            holoGlare.style.setProperty('--glare-y', `${glareY}%`);
        }

        function resetCardTilt() {
            card3D.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            holoGlare.style.setProperty('--glare-x', `50%`);
            holoGlare.style.setProperty('--glare-y', `50%`);
        }

        cardStage.addEventListener('mousemove', (e) => handleCardMove(e.clientX, e.clientY));
        cardStage.addEventListener('mouseleave', resetCardTilt);

        cardStage.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                handleCardMove(touch.clientX, touch.clientY);
            }
        }, { passive: true });
        cardStage.addEventListener('touchend', resetCardTilt);


        /* ==========================================================================
           2. THREE.JS 3D BACKGROUND SCENE (3D CAKE, FLAME, FLOATING BALLOONS, STARS)
           ========================================================================== */
        let scene, camera, renderer;
        let balloons = [];
        let cakeGroup, candleFlame, flameLight;
        let isCandleLit = true;
        let isDraggingScene = false;
        let prevMouseX = 0;

        function initThreeScene() {
            const canvas = document.getElementById('bg-canvas');
            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 1.2, 13);

            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Ambient & Festive Point Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
            scene.add(ambientLight);

            const blueLight = new THREE.PointLight(0x38bdf8, 1.8, 30);
            blueLight.position.set(8, 6, 6);
            scene.add(blueLight);

            const purpleLight = new THREE.PointLight(0xa855f7, 1.6, 30);
            purpleLight.position.set(-8, -4, 5);
            scene.add(purpleLight);

            // Create 3D Birthday Cake
            create3DBirthdayCake();

            // Create Floating 3D Balloons
            create3DBalloons();

            // Create 3D Starfield Particles
            createStarfield();

            // Mouse/Touch Camera Orbit Interaction for Scene background
            window.addEventListener('mousedown', (e) => {
                isDraggingScene = true;
                prevMouseX = e.clientX;
            });
            window.addEventListener('mouseup', () => { isDraggingScene = false; });
            window.addEventListener('mousemove', (e) => {
                if (isDraggingScene && cakeGroup) {
                    const deltaX = e.clientX - prevMouseX;
                    cakeGroup.rotation.y += deltaX * 0.01;
                    prevMouseX = e.clientX;
                }
            });

            window.addEventListener('resize', onWindowResize);
            animateThree();
        }

        function create3DBirthdayCake() {
            cakeGroup = new THREE.Group();

            // Cake Plate
            const plateGeo = new THREE.CylinderGeometry(2.2, 2.0, 0.15, 32);
            const plateMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5, roughness: 0.2 });
            const plate = new THREE.Mesh(plateGeo, plateMat);
            plate.position.y = -1.2;
            cakeGroup.add(plate);

            // Bottom Tier
            const bottomGeo = new THREE.CylinderGeometry(1.7, 1.7, 1.1, 32);
            const bottomMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
            const bottomTier = new THREE.Mesh(bottomGeo, bottomMat);
            bottomTier.position.y = -0.6;
            cakeGroup.add(bottomTier);

            // Gold Trim Ring
            const ringGeo = new THREE.TorusGeometry(1.72, 0.07, 16, 48);
            const ringMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = -0.1;
            cakeGroup.add(ring);

            // Top Tier
            const topGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.9, 32);
            const topMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
            const topTier = new THREE.Mesh(topGeo, topMat);
            topTier.position.y = 0.35;
            cakeGroup.add(topTier);

            // Candle Cylinder
            const candleGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.85, 16);
            const candleMat = new THREE.MeshStandardMaterial({ color: 0xfef08a });
            const candle = new THREE.Mesh(candleGeo, candleMat);
            candle.position.y = 1.2;
            cakeGroup.add(candle);

            // 3D Candle Flame
            const flameGeo = new THREE.ConeGeometry(0.18, 0.45, 16);
            const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
            candleFlame = new THREE.Mesh(flameGeo, flameMat);
            candleFlame.position.y = 1.85;
            cakeGroup.add(candleFlame);

            // Warm Flame Light
            flameLight = new THREE.PointLight(0xfbbf24, 2.2, 10);
            flameLight.position.set(0, 2.0, 0);
            cakeGroup.add(flameLight);

            // Position the 3D Cake in view
            cakeGroup.position.set(-5.5, -2.5, 1.5);
            cakeGroup.rotation.x = 0.18;
            scene.add(cakeGroup);
        }

        function create3DBalloons() {
            const colors = [0x38bdf8, 0xa855f7, 0xfbbf24, 0xec4899, 0x6366f1];
            const sphereGeo = new THREE.SphereGeometry(0.75, 28, 28);

            for (let i = 0; i < 16; i++) {
                const balloonGroup = new THREE.Group();
                const mat = new THREE.MeshStandardMaterial({
                    color: colors[i % colors.length],
                    roughness: 0.15,
                    metalness: 0.25
                });

                const mesh = new THREE.Mesh(sphereGeo, mat);
                mesh.scale.set(1, 1.18, 1);
                balloonGroup.add(mesh);

                // Balloon Knot
                const knotGeo = new THREE.ConeGeometry(0.12, 0.15, 12);
                const knot = new THREE.Mesh(knotGeo, mat);
                knot.position.y = -0.9;
                balloonGroup.add(knot);

                // Balloon String
                const stringGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.8, 6);
                const stringMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
                const stringMesh = new THREE.Mesh(stringGeo, stringMat);
                stringMesh.position.y = -1.8;
                balloonGroup.add(stringMesh);

                // Distribute across the 3D scene
                balloonGroup.position.set(
                    (Math.random() - 0.5) * 24,
                    (Math.random() - 0.5) * 16,
                    (Math.random() - 0.5) * 10 - 3
                );

                balloonGroup.userData = {
                    speedY: 0.012 + Math.random() * 0.02,
                    swaySpeed: 0.5 + Math.random() * 1.5,
                    swayOffset: Math.random() * Math.PI * 2
                };

                scene.add(balloonGroup);
                balloons.push(balloonGroup);
            }
        }

        function createStarfield() {
            const starsGeo = new THREE.BufferGeometry();
            const count = 450;
            const positions = new Float32Array(count * 3);

            for (let i = 0; i < count * 3; i++) {
                positions[i] = (Math.random() - 0.5) * 45;
            }

            starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const starsMat = new THREE.PointsMaterial({
                color: 0xf8fafc,
                size: 0.09,
                transparent: true,
                opacity: 0.75
            });

            const starField = new THREE.Points(starsGeo, starsMat);
            scene.add(starField);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);

            // Adjust cake position on smaller mobile screens
            if (cakeGroup) {
                if (window.innerWidth < 768) {
                    cakeGroup.position.set(0, -4.2, -1);
                    cakeGroup.scale.set(0.75, 0.75, 0.75);
                } else {
                    cakeGroup.position.set(-5.5, -2.5, 1.5);
                    cakeGroup.scale.set(1, 1, 1);
                }
            }
        }

        function animateThree() {
            requestAnimationFrame(animateThree);
            const time = performance.now() * 0.001;

            // Animate floating 3D balloons
            balloons.forEach(b => {
                b.position.y += b.userData.speedY;
                b.position.x += Math.sin(time * b.userData.swaySpeed + b.userData.swayOffset) * 0.008;
                b.rotation.z = Math.sin(time * b.userData.swaySpeed) * 0.08;

                if (b.position.y > 11) {
                    b.position.y = -11;
                }
            });

            // Rotate 3D Birthday Cake & flicker candle flame
            if (cakeGroup) {
                cakeGroup.rotation.y += 0.007;
            }
            if (candleFlame && isCandleLit) {
                candleFlame.scale.x = 1 + Math.sin(time * 18) * 0.12;
                candleFlame.scale.y = 1 + Math.cos(time * 15) * 0.12;
                flameLight.intensity = 2.0 + Math.sin(time * 20) * 0.4;
            }

            renderer.render(scene, camera);
        }


        /* ==========================================================================
           3. BLOW OUT THE 3D CANDLE, CONFETTI & SYNTHESIZED BIRTHDAY MELODY
           ========================================================================== */
        function blowOutCandle() {
            const titleEl = document.getElementById('candle-status-title');
            const subEl = document.getElementById('candle-status-sub');

            if (isCandleLit) {
                isCandleLit = false;
                if (candleFlame) candleFlame.visible = false;
                if (flameLight) flameLight.intensity = 0;

                titleEl.innerHTML = `<span class="text-amber-300">✨ Wish Sent to the Universe! ✨</span>`;
                subEl.textContent = "Click again to relight the 3D birthday candle";
                triggerMegaCelebration();
                if (!isPlayingMusic) toggleBirthdayMusic();
            } else {
                isCandleLit = true;
                if (candleFlame) candleFlame.visible = true;
                if (flameLight) flameLight.intensity = 2.2;

                titleEl.innerHTML = `<span>Make a Wish & Blow the 3D Candle</span><i class="ph-bold ph-wind text-amber-400"></i>`;
                subEl.textContent = "Click to blow out the candle on the 3D cake!";
            }
        }

        function triggerMegaCelebration() {
            if (typeof confetti !== 'function') return;

            const duration = 2400;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.7 },
                    colors: ['#38bdf8', '#a855f7', '#fbbf24', '#ec4899']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.7 },
                    colors: ['#38bdf8', '#a855f7', '#fbbf24', '#ec4899']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            })();
        }

        // Web Audio API Synthesizer for "Happy Birthday" Melody
        let audioCtx = null;
        let isPlayingMusic = false;
        let melodyTimeouts = [];

        const happyBirthdayNotes = [
            { note: 261.63, dur: 300 }, // C4
            { note: 261.63, dur: 250 }, // C4
            { note: 293.66, dur: 550 }, // D4
            { note: 261.63, dur: 550 }, // C4
            { note: 349.23, dur: 550 }, // F4
            { note: 329.63, dur: 1000 },// E4

            { note: 261.63, dur: 300 }, // C4
            { note: 261.63, dur: 250 }, // C4
            { note: 293.66, dur: 550 }, // D4
            { note: 261.63, dur: 550 }, // C4
            { note: 392.00, dur: 550 }, // G4
            { note: 349.23, dur: 1000 },// F4

            { note: 261.63, dur: 300 }, // C4
            { note: 261.63, dur: 250 }, // C4
            { note: 523.25, dur: 550 }, // C5
            { note: 440.00, dur: 550 }, // A4
            { note: 349.23, dur: 550 }, // F4
            { note: 329.63, dur: 550 }, // E4
            { note: 293.66, dur: 900 }, // D4

            { note: 466.16, dur: 300 }, // Bb4
            { note: 466.16, dur: 250 }, // Bb4
            { note: 440.00, dur: 550 }, // A4
            { note: 349.23, dur: 550 }, // F4
            { note: 392.00, dur: 550 }, // G4
            { note: 349.23, dur: 1100 } // F4
        ];

        function playSynthNote(freq, duration) {
            if (!audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.22, audioCtx.currentTime + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration / 1000);
        }

        function toggleBirthdayMusic() {
            const musicText = document.getElementById('music-text');
            const musicIcon = document.getElementById('music-icon');

            if (isPlayingMusic) {
                isPlayingMusic = false;
                melodyTimeouts.forEach(t => clearTimeout(t));
                melodyTimeouts = [];
                musicText.textContent = 'Play Birthday Tune';
                musicIcon.className = 'ph-fill ph-music-notes text-lg';
                return;
            }

            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            isPlayingMusic = true;
            musicText.textContent = 'Stop Music';
            musicIcon.className = 'ph-fill ph-speaker-high text-lg animate-pulse';

            let elapsed = 0;
            happyBirthdayNotes.forEach((item, index) => {
                const t = setTimeout(() => {
                    if (isPlayingMusic) {
                        playSynthNote(item.note, item.dur);
                    }
                    if (index === happyBirthdayNotes.length - 1) {
                        isPlayingMusic = false;
                        musicText.textContent = 'Play Birthday Tune';
                        musicIcon.className = 'ph-fill ph-music-notes text-lg';
                    }
                }, elapsed);
                melodyTimeouts.push(t);
                elapsed += item.dur + 70;
            });
        }


        /* ==========================================================================
           4. WISH PRESET SELECTOR
           ========================================================================== */
        const presetWishes = [
            "Wishing you a year filled with unstoppable energy, late-night adventures, big wins, and unforgettable memories! May every dream you chase turn into reality. Keep shining and staying iconic!",
            "Happy Birthday! Grateful for all the laughs, great conversations, and awesome moments we've shared. May this new chapter bring you endless happiness, peace, and everything your heart desires!",
            "Here's to leveling up! May this year bring massive breakthroughs, exciting new opportunities, and relentless success in everything you set your mind to. Keep conquering!",
            "Happy Birthday! Another year wiser, cooler, and still looking legendary even behind a mask! Have an absolute blast today—eat extra cake and celebrate big!"
        ];

        function setPresetWish(index) {
            const msgEl = document.getElementById('display-message');
            msgEl.style.opacity = '0';
            setTimeout(() => {
                msgEl.textContent = presetWishes[index];
                msgEl.style.opacity = '1';
            }, 150);
        }

        // Start 3D scene and initial celebration on load
        window.onload = function() {
            initThreeScene();
            onWindowResize();
            setTimeout(triggerMegaCelebration, 600);
        };
    