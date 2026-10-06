import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import watchGold from "@/assets/watch-gold.png";
import watchSteel from "@/assets/watch-steel.png";
import watchRosegold from "@/assets/watch-rosegold.png";
import watchBlack from "@/assets/watch-black.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Airplanes — The beginners guide" },
      {
        name: "description",
        content:
          "A scroll-driven 3D passenger airplane story: follow a realistic jet as it flies, banks and climbs.",
      },
      { property: "og:title", content: "Airplanes — The beginners guide" },
      {
        property: "og:description",
        content:
          "A scroll-driven 3D passenger airplane story: follow a realistic jet as it flies, banks and climbs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    const cleanups: Array<() => void> = [];

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { ScrollToPlugin }, THREE, { OBJLoader }, { RoomEnvironment }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("gsap/ScrollToPlugin"),
          import("three"),
          import("three/examples/jsm/loaders/OBJLoader.js"),
          import("three/examples/jsm/environments/RoomEnvironment.js"),
        ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

      class Scene {
        views: Array<{ bottom: number; height: number; camera: any }>;
        renderer: any;
        scene: any;
        light: any;
        softLight: any;
        modelGroup: any;
        w = 0;
        h = 0;

        constructor(model: any) {
          this.views = [
            { bottom: 0, height: 1, camera: null },
            { bottom: 0, height: 0, camera: null },
          ];

          this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
          this.renderer.setSize(window.innerWidth, window.innerHeight);
          this.renderer.shadowMap.enabled = true;
          this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
           this.renderer.toneMappingExposure = 1.35;
          document.body.appendChild(this.renderer.domElement);

          this.scene = new THREE.Scene();

          // Image-based lighting for realistic metal/paint reflections.
          const pmrem = new THREE.PMREMGenerator(this.renderer);
          const envScene = new RoomEnvironment();
          this.scene.environment = pmrem.fromScene(envScene, 0.04).texture;
          pmrem.dispose();

          for (let ii = 0; ii < this.views.length; ++ii) {
            const view = this.views[ii]!;
            const camera = new THREE.PerspectiveCamera(
              45,
              window.innerWidth / window.innerHeight,
              1,
              2000,
            );
            camera.position.fromArray([0, 0, 180]);
            camera.layers.disableAll();
            camera.layers.enable(ii);
            view.camera = camera;
            camera.lookAt(new THREE.Vector3(0, 5, 0));
          }

          this.light = new THREE.PointLight(0xffffff, 2);
          this.light.position.z = 150;
          this.light.position.x = 70;
          this.light.position.y = -20;
          this.scene.add(this.light);

           this.softLight = new THREE.AmbientLight(0xffffff, 0.65);
          this.scene.add(this.softLight);
           const fill = new THREE.DirectionalLight(0xdceafb, 2.7);
          fill.position.set(-60, 80, 40);
          this.scene.add(fill);
           const rim = new THREE.DirectionalLight(0xffebd1, 2);
          rim.position.set(30, 20, -90);
          this.scene.add(rim);
           const sideFill = new THREE.DirectionalLight(0xffffff, 1.4);
           sideFill.position.set(70, 30, 50);
           this.scene.add(sideFill);

          this.onResize();
          window.addEventListener("resize", this.onResize, false);

          let raf = 0;
          const animate = () => {
            this.render();
            raf = requestAnimationFrame(animate);
          };
          animate();

          cleanups.push(() => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", this.onResize);
            this.renderer.domElement.remove();
            this.renderer.dispose();
          });

          this.modelGroup = model;
          this.scene.add(this.modelGroup);
        }

        render = () => {
          for (let ii = 0; ii < this.views.length; ++ii) {
            const view = this.views[ii]!;
            const camera = view.camera;
            const bottom = Math.floor(this.h * view.bottom);
            const height = Math.floor(this.h * view.height);
            if (height <= 0) continue;

            this.renderer.setViewport(0, 0, this.w, this.h);
            this.renderer.setScissor(0, bottom, this.w, height);
            this.renderer.setScissorTest(true);

            camera.aspect = this.w / this.h;
            camera.updateProjectionMatrix();
            this.renderer.render(this.scene, camera);
          }
        };

        onResize = () => {
          this.w = window.innerWidth;
          this.h = window.innerHeight;
          for (let ii = 0; ii < this.views.length; ++ii) {
            const camera = this.views[ii]!.camera;
            camera.aspect = this.w / this.h;
            camera.position.z = 180;
            camera.updateProjectionMatrix();
          }
          this.renderer.setSize(this.w, this.h);
          this.render();
        };
      }

      function setupAnimation(model: any) {
        if (disposed) return;
        const scene = new Scene(model);
        const plane = scene.modelGroup;

        const ctx = gsap.context(() => {
          gsap.fromTo(
            scene.renderer.domElement,
            { x: "50%", autoAlpha: 0 },
            { duration: 1, x: "0%", autoAlpha: 1, delay: 0.5 },
          );
           gsap.to(".loading", { autoAlpha: 0, duration: 0.4 });
          gsap.to(".scroll-cta", { opacity: 1 });
          gsap.set("svg", { autoAlpha: 1 });

          const tau = Math.PI * 2;
          gsap.set(plane.rotation, { y: tau * -0.25 });
            gsap.set(plane.position, { x: 18, y: -8, z: 0 });
          scene.render();

          const sectionDuration = 1;

          gsap.to("#line-length", {
            strokeDashoffset: 0,
            scrollTrigger: { trigger: ".length", scrub: true, start: "top bottom", end: "top top" },
          });
          gsap.to("#line-wingspan", {
            strokeDashoffset: 0,
            scrollTrigger: {
              trigger: ".wingspan",
              scrub: true,
              start: "top 25%",
              end: "bottom 50%",
            },
          });
          gsap.to("#circle-phalange", {
            strokeDashoffset: 0,
            scrollTrigger: {
              trigger: ".phalange",
              scrub: true,
              start: "top 50%",
              end: "bottom 100%",
            },
          });
          gsap.to("#line-length", {
            opacity: 0,
            strokeDashoffset: 80,
            scrollTrigger: { trigger: ".length", scrub: true, start: "top top", end: "bottom top" },
          });
          gsap.to("#line-wingspan", {
            opacity: 0,
            strokeDashoffset: 110,
            scrollTrigger: {
              trigger: ".wingspan",
              scrub: true,
              start: "top top",
              end: "bottom top",
            },
          });
          gsap.to("#circle-phalange", {
            opacity: 0,
            strokeDashoffset: 94,
            scrollTrigger: {
              trigger: ".phalange",
              scrub: true,
              start: "top top",
              end: "bottom top",
            },
          });

          const tl = gsap.timeline({
            onUpdate: scene.render,
            scrollTrigger: {
              trigger: ".content",
              scrub: true,
              start: "top top",
              end: "bottom bottom",
            },
            defaults: { duration: sectionDuration, ease: "power2.inOut" },
          });

          let delay = 0;
          tl.to(".scroll-cta", { duration: 0.25, opacity: 0 }, delay);
           tl.to(plane.position, { x: -10, ease: "power1.in" }, delay);

          delay += sectionDuration;
          tl.to(plane.rotation, { x: tau * 0.25, y: 0, z: -tau * 0.05, ease: "power1.inOut" }, delay);
          tl.to(plane.position, { x: -40, y: 0, z: -60, ease: "power1.inOut" }, delay);

          delay += sectionDuration;
          tl.to(plane.rotation, { x: tau * 0.25, y: 0, z: tau * 0.05, ease: "power3.inOut" }, delay);
          tl.to(plane.position, { x: 40, y: 0, z: -60, ease: "power2.inOut" }, delay);

          delay += sectionDuration;
          tl.to(plane.rotation, { x: tau * 0.2, y: 0, z: -tau * 0.1, ease: "power3.inOut" }, delay);
          tl.to(plane.position, { x: -40, y: 0, z: -30, ease: "power2.inOut" }, delay);

          delay += sectionDuration;
          tl.to(plane.rotation, { x: 0, z: 0, y: tau * 0.25 }, delay);
          tl.to(plane.position, { x: 0, y: -10, z: 50 }, delay);

          delay += sectionDuration * 2;
          tl.to(plane.rotation, { x: tau * 0.25, y: tau * 0.5, z: 0, ease: "power4.inOut" }, delay);
          tl.to(plane.position, { z: 30, ease: "power4.inOut" }, delay);

          delay += sectionDuration;
          tl.to(plane.rotation, { x: tau * 0.25, y: tau * 0.5, z: 0, ease: "power4.inOut" }, delay);
          tl.to(plane.position, { z: 60, x: 30, ease: "power4.inOut" }, delay);

          delay += sectionDuration;
          tl.to(
            plane.rotation,
            { x: tau * 0.35, y: tau * 0.75, z: tau * 0.6, ease: "power4.inOut" },
            delay,
          );
          tl.to(plane.position, { z: 100, x: 20, y: 0, ease: "power4.inOut" }, delay);

          delay += sectionDuration;
          tl.to(plane.rotation, { x: tau * 0.15, y: tau * 0.85, z: 0, ease: "power1.in" }, delay);
          tl.to(plane.position, { z: -150, x: 0, y: 0, ease: "power1.inOut" }, delay);

          delay += sectionDuration;
          tl.to(
            plane.rotation,
            { duration: sectionDuration, x: -tau * 0.05, y: tau, z: -tau * 0.1, ease: "none" },
            delay,
          );
          tl.to(
            plane.position,
            { duration: sectionDuration, x: 0, y: 30, z: 320, ease: "power1.in" },
            delay,
          );
          tl.to(scene.light.position, { duration: sectionDuration, x: 0, y: 0, z: 0 }, delay);
        });

        cleanups.push(() => ctx.revert());
      }

      gsap.set("#line-length", { strokeDasharray: 80, strokeDashoffset: 80 });
      gsap.set("#line-wingspan", { strokeDasharray: 110, strokeDashoffset: 110 });
      gsap.set("#circle-phalange", { strokeDasharray: 94, strokeDashoffset: 94 });

      // Public-domain jetliner mesh by NuclearOsmosis (OpenGameArt.org).
      new OBJLoader().load(
        "/models/jetliner.obj",
        (aircraft) => {
          if (disposed) return;
           const paint = new THREE.MeshPhysicalMaterial({ color: 0xf0f3f3, metalness: 0.22, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide });
           const wingPaint = new THREE.MeshPhysicalMaterial({ color: 0xc9d1d4, metalness: 0.55, roughness: 0.29, clearcoat: 0.7, clearcoatRoughness: 0.18, side: THREE.DoubleSide });
           const navy = new THREE.MeshPhysicalMaterial({ color: 0x102d39, metalness: 0.35, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.1, side: THREE.DoubleSide });
           const champagne = new THREE.MeshPhysicalMaterial({ color: 0xc6a775, metalness: 0.8, roughness: 0.24, side: THREE.DoubleSide });
            const glass = new THREE.MeshPhysicalMaterial({ color: 0x071820, metalness: 0.18, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03, side: THREE.DoubleSide });
           const intake = new THREE.MeshStandardMaterial({ color: 0x15232a, metalness: 0.75, roughness: 0.34, side: THREE.DoubleSide });
          aircraft.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            child.material = child.name.includes("Tail") ? navy : child.name.includes("Wings") || child.name.includes("TurboFans") ? wingPaint : paint;
            child.castShadow = true;
            child.receiveShadow = true;
          });
          const detail = new THREE.Group();
          aircraft.add(detail);
          const addDetail = (geometry: any, material: any, x: number, y: number, z: number) => {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            detail.add(mesh);
            return mesh;
          };
           // Extend the original low-detail fuselage into a smooth, tapered radome.
           // The overlap sits inside the OBJ shell so the new nose reads as one continuous body.
           const radomeProfile = [
             new THREE.Vector2(1.04, 0),
             new THREE.Vector2(1.02, 0.2),
             new THREE.Vector2(0.94, 0.48),
             new THREE.Vector2(0.78, 0.78),
             new THREE.Vector2(0.55, 1.04),
             new THREE.Vector2(0.32, 1.24),
             new THREE.Vector2(0.15, 1.35),
             new THREE.Vector2(0.1, 1.39),
           ];
           const radome = addDetail(new THREE.LatheGeometry(radomeProfile, 48), paint, 0, 6.08, 7.08);
           radome.rotation.x = Math.PI / 2;
           radome.scale.y = 0.88;
           const noseCap = addDetail(new THREE.SphereGeometry(0.19, 32, 16), paint, 0, 6.08, 8.31);
           noseCap.scale.set(0.82, 0.82, 1.08);
           const radomeSeam = addDetail(new THREE.TorusGeometry(0.91, 0.012, 8, 48), champagne, 0, 6.08, 7.14);
           radomeSeam.scale.y = 0.82;

           // A real flight deck uses swept, flush glazing rather than bulb-shaped windows.
           const makeCockpitPanel = (side: number, points: Array<[number, number]>) => {
             const x = side * 1.075;
             const positions = new Float32Array([
               x, points[0][0], points[0][1],
               x, points[1][0], points[1][1],
               x, points[2][0], points[2][1],
               x, points[0][0], points[0][1],
               x, points[2][0], points[2][1],
               x, points[3][0], points[3][1],
             ]);
             const geometry = new THREE.BufferGeometry();
             geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
             geometry.computeVertexNormals();
             const panel = new THREE.Mesh(geometry, glass);
             detail.add(panel);
             return panel;
           };
           for (const side of [-1, 1]) {
             makeCockpitPanel(side, [
               [6.57, 7.7],
               [6.62, 7.24],
               [7.02, 7.17],
               [6.97, 7.56],
             ]);
             makeCockpitPanel(side, [
               [6.62, 7.2],
               [6.64, 6.82],
               [6.99, 6.88],
               [7.02, 7.14],
             ]);
           }
           const windowShape = new THREE.SphereGeometry(0.11, 12, 10);
           const windowTrim = new THREE.MeshStandardMaterial({ color: 0x89979a, metalness: 0.65, roughness: 0.34 });
           for (let z = -5.7; z < 6.0; z += 0.68) {
            for (const side of [-1, 1]) {
               const surround = addDetail(windowShape, windowTrim, side * 1.14, 6.46, z);
               surround.scale.set(0.48, 1.27, 0.92);
               const window = addDetail(windowShape, glass, side * 1.17, 6.46, z);
               window.scale.set(0.44, 1.13, 0.82);
            }
          }
          for (const side of [-1, 1]) {
             // Continuous pinstripes give the fuselage a considered private-aviation livery.
             const stripe = new THREE.Mesh(new THREE.TubeGeometry(
               new THREE.CatmullRomCurve3([
                 new THREE.Vector3(side * 0.85, 5.91, -7.3),
                 new THREE.Vector3(side * 1.18, 5.91, -5.7),
                 new THREE.Vector3(side * 1.23, 5.91, 3.5),
                 new THREE.Vector3(side * 0.91, 5.91, 7.5),
               ]), 80, 0.055, 6, false), navy);
             detail.add(stripe);
             const accent = new THREE.Mesh(new THREE.TubeGeometry(
               new THREE.CatmullRomCurve3([
                 new THREE.Vector3(side * 0.84, 5.82, -7.1),
                 new THREE.Vector3(side * 1.17, 5.82, -5.6),
                 new THREE.Vector3(side * 1.22, 5.82, 3.5),
                 new THREE.Vector3(side * 0.91, 5.82, 7.3),
               ]), 80, 0.013, 5, false), champagne);
             detail.add(accent);
             const engineFace = addDetail(new THREE.CircleGeometry(0.47, 32), intake, side * 3.12, 4.74, 2.56);
             engineFace.rotation.y = Math.PI;
             const spinner = addDetail(new THREE.ConeGeometry(0.13, 0.28, 20), wingPaint, side * 3.12, 4.74, 2.58);
             spinner.rotation.x = Math.PI / 2;
             const rim = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.035, 8, 32), champagne);
             rim.position.set(side * 3.12, 4.74, 2.58);
             detail.add(rim);
          }
          const jet = new THREE.Group();
          aircraft.position.y = -6.7;
          jet.add(aircraft);
          jet.scale.setScalar(4.5);
          setupAnimation(jet);
        },
        undefined,
        (error) => console.error("Passenger airplane model could not load", error),
      );
    })();

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  const scrollToBottom = async () => {
    const { gsap } = await import("gsap");
    gsap.to(window, {
      duration: 1.5,
      scrollTo: { y: document.body.scrollHeight, autoKill: false },
      ease: "power2.inOut",
    });
  };

  return (
    <div ref={rootRef} className="plane-app">
      <button id="contact-btn" className="contact-btn" onClick={scrollToBottom}>
        Contact
      </button>
      <div className="content">
        <div className="loading">Loading</div>
        <div className="trigger" />
        <div className="section">
          <h1>Airplanes.</h1>
          <h3>The beginners guide.</h3>
          <p>You've probably forgotten what these are.</p>
          <div className="scroll-cta">Scroll</div>
        </div>
        <div className="section right">
          <h2>They're kinda like buses...</h2>
          <img src={watchSteel} alt="Luxury steel dive watch" className="watch-img" width={1024} height={1024} loading="lazy" />
        </div>
        <div className="ground-container">
          <div className="section right">
            <h2>..except they leave the ground.</h2>
            <p>Saaay what!?.</p>
            <img src={watchRosegold} alt="Luxury rose gold watch" className="watch-img" width={1024} height={1024} loading="lazy" />
          </div>
          <div className="section">
            <h2>They fly through the sky.</h2>
            <p>For realsies!</p>
            <img src={watchBlack} alt="Luxury black skeleton watch" className="watch-img" width={1024} height={1024} loading="lazy" />
          </div>
          <div className="section right">
            <h2>Defying all known physical laws.</h2>
            <p>It's actual magic!</p>
            <img src={watchGold} alt="Luxury gold chronograph watch" className="watch-img" width={1024} height={1024} loading="lazy" />
          </div>
        </div>

        <div className="blueprint">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <line
              id="line-length"
              x1="10"
              y1="80"
              x2="90"
              y2="80"
              strokeWidth="0.5"
              stroke="white"
            />
            <path
              id="line-wingspan"
              d="M10 50, L40 35, M60 35 L90 50"
              strokeWidth="0.5"
              stroke="white"
              fill="none"
            />
            <circle
              id="circle-phalange"
              cx="60"
              cy="60"
              r="15"
              fill="transparent"
              strokeWidth="0.5"
              stroke="white"
            />
          </svg>
          <div className="section dark">
            <h2>The facts and figures.</h2>
            <p>Lets get into the nitty gritty...</p>
            <img src={watchSteel} alt="Luxury steel dive watch" className="watch-img" width={1024} height={1024} loading="lazy" />
          </div>
          <div className="section dark length">
            <h2>Length.</h2>
            <p>Long.</p>
            <img src={watchBlack} alt="Luxury black skeleton watch" className="watch-img" width={1024} height={1024} loading="lazy" />
          </div>
          <div className="section dark wingspan">
            <h2>Wing Span.</h2>
            <p>I dunno, longer than a cat probably.</p>
            <img src={watchGold} alt="Luxury gold chronograph watch" className="watch-img" width={1024} height={1024} loading="lazy" />
          </div>
          <div className="section dark phalange">
            <h2>Left Phalange</h2>
            <p>Missing</p>
            <img src={watchRosegold} alt="Luxury rose gold watch" className="watch-img" width={1024} height={1024} loading="lazy" />
          </div>
          <div className="section dark">
            <h2>Engines</h2>
            <p>Turbine funtime</p>
            <img src={watchSteel} alt="Luxury steel dive watch" className="watch-img" width={1024} height={1024} loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  );
}
