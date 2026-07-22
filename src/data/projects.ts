import type { ImageMetadata } from 'astro';

import cupidImg from '../assets/images/projects/cupidglasses.jpg';
import muxboxImg from '../assets/images/projects/muxbox.jpg';
import rfImg from '../assets/images/projects/rfpoweramplifier.jpg';
import seismoImg from '../assets/images/projects/seismolink.jpg';

import cupidAwkward from '../assets/images/projects/cupid-awkward-conversation-blue.png';
import cupidTopDown from '../assets/images/projects/cupid-top-down.png';
import cupidAwards from '../assets/images/projects/cupid-awards-ceremony.jpg';

import muxboxWiring from '../assets/images/projects/muxbox-internal-wiring.jpg';
import muxboxEnclosure from '../assets/images/projects/muxbox-enclosure-model.png';
import muxboxModelsim from '../assets/images/projects/muxbox-modelsim.png';

import rfBreadboard from '../assets/images/projects/rf-breadboard-testing.jpg';
import rfPcbTesting from '../assets/images/projects/rf-pcb-testing.jpg';
import rfLabelledPcb from '../assets/images/projects/rf-labelled-pcb.png';

import seismoEarthquake from '../assets/images/projects/seismo-earthquake-aftermath.webp';
import seismoAlarm from '../assets/images/projects/seismo-alarm-internals.png';
import seismoDisplacement from '../assets/images/projects/seismo-displacement-map.jpg';

import myoarmPhoto from '../assets/images/projects/myoarm-photo.jpg';
import myoarmFusion from '../assets/images/projects/myoarm-fusion360.jpg';

export interface ProjectDetailMedia {
  kind: 'image' | 'video' | 'asic' | 'obj';
  image?: ImageMetadata;
  alt?: string;
  caption?: string;
  /** CSS object-position for the cropped image, e.g. "center 80%" */
  imagePosition?: string;
  videoId?: string;
  videoTitle?: string;
  modelUrl?: string;
}

export interface ProjectDetailSection {
  /** Subsection heading */
  heading: string;
  paragraphs?: string[];
  /** Numbered/bulleted list, e.g. SeismoLink's roadmap */
  list?: string[];
  media?: ProjectDetailMedia;
}

export interface ProjectDetail {
  /** Date range as it appears on the résumé, e.g. "Feb 2026" */
  timeframe?: string;
  /** Tools/technologies named in the source material */
  techStack?: string[];
  /** Named awards/recognition, shown as gold pills */
  recognition?: string[];
  sections: ProjectDetailSection[];
}

export interface Project {
  slug: string;
  /** Display name — matches the original site's project names */
  name: string;
  /** Single-sentence description of what the project does */
  description: string;
  /** Key result / award (shown in green on the original site) */
  result?: string;
  /**
   * "asic" renders the self-hosted Tiny Tapeout viewer,
   * "obj" renders an interactive Three.js .obj model (see modelUrl),
   * "image" renders a still photo (see image),
   * "model" renders a placeholder box awaiting a 3D model.
   */
  media: 'asic' | 'obj' | 'image' | 'model';
  /** URL of the .obj model when media === "obj" */
  modelUrl?: string;
  /** Photo when media === "image" */
  image?: ImageMetadata;
  /** Destination for the project detail page */
  href: string;
  /** Full case-study content for the detail page */
  detail?: ProjectDetail;
}

/**
 * Projects in display order. The section alternates the model/text sides:
 * index 0 → model left, index 1 → model right, and so on.
 */
export const projects: Project[] = [
  {
    slug: 'raytracing-asic',
    name: 'Raytracing ASIC',
    description:
      'A custom ready for fabrication raytracing accelerator designed to speed up the rendering of 3D scenes.',
    media: 'asic',
    href: '/projects/raytracing-asic',
    detail: {
      timeframe: 'Feb 2026',
      techStack: [
        'RTL / ASIC design',
        'FPGA',
        'Xilinx Vivado',
        'Cocotb',
        'Tiny Tapeout (SKY130)',
        'Python',
        'Testbenches',
      ],
      sections: [
        {
          heading: 'The pipeline',
          paragraphs: [
            'This is a hardware/software pipeline that turns 3D models into rendered images using ray tracing, where each pixel’s color is computed by finding the first surface its corresponding ray hits in the scene.',
            'On the software side, 3D models are preprocessed into a compact 3D scene representation — solid vs. empty — and streamed into the ASIC through a dedicated scene-loading interface.',
          ],
        },
        {
          heading: 'Chip architecture',
          paragraphs: [
            'The ASIC accepts rays and repeatedly steps through the scene to find the first hit location, using pipelined compute stages. On a 32×32×32 scene, this reaches an estimated throughput of 1.8 million rays per second.',
          ],
          media: { kind: 'asic' },
        },
        {
          heading: 'Rendering the image',
          paragraphs: [
            'A software rendering application and GUI sends one ray per pixel to the chip, then converts the returned hits into final pixel colors — applying lighting calculations, shadows, and multiple light sources to produce a realistic image.',
          ],
        },
        {
          heading: 'Design tradeoffs',
          paragraphs: [
            'Every design decision was made with power, performance, and area (PPA) in mind: compact scene encodings, fixed-point arithmetic instead of floating point, and a maximum step limit that bounds the worst-case work per ray.',
          ],
        },
        {
          heading: 'Verification & fabrication',
          paragraphs: [
            'Correctness was verified at both the module and full-chip level using reference models that compute expected results, combining directed edge-case tests with large randomized regressions — 10,000+ inputs — using repeatable seeds.',
            'Manufacturability was validated by synthesizing the design through Tiny Tapeout, producing a fabrication-ready netlist on the SKY130 process.',
          ],
        },
      ],
    },
  },
  {
    slug: 'cupidglasses',
    name: 'Cupid Glasses',
    description:
      'Wearable smart glasses that pair a live camera feed with facial recognition and Google Gemini to generate personalized icebreakers in real time.',
    result: "Winner of Canada's largest hardware hackathon (MakeUofT 2026).",
    media: 'image',
    image: cupidImg,
    href: '/projects/cupidglasses',
    detail: {
      timeframe: 'Feb 2026 — MakeUofT hackathon',
      techStack: [
        'ESP32 microcontroller',
        'Python',
        'OpenCV',
        'Flutter',
        'Firebase',
        'DeepFace',
        'Google Gemini API',
      ],
      recognition: [
        "1st Place, Valentine's Theme — MakeUofT 2026",
        'Best Use of Google Gemini API — MakeUofT 2026',
      ],
      sections: [
        {
          heading: 'The problem',
          paragraphs: [
            'Starting a conversation can feel awkward, even when you already know something about the person in front of you. In social settings, it can be hard to think of the right thing to say quickly, especially if you are trying to make the conversation feel personal instead of generic.',
            'Cupid Glasses started from that gap: what would it look like if a wearable device could quietly understand who you are talking to and help you start a better conversation in real time?',
          ],
          media: {
            kind: 'image',
            image: cupidAwkward,
            alt: 'Illustration of two people having an awkward conversation',
            caption: 'An awkward first conversation',
          },
        },
        {
          heading: 'What it does',
          paragraphs: [
            'Cupid Glasses are wearable smart glasses that generate personalized icebreakers while you are talking to someone. The user first creates profiles in a mobile app — built in Flutter — with each person’s name, photo, and interests. When the glasses see someone, the system matches the live camera feed to a saved profile, combines that person’s interests with their inferred emotion, and uses Google Gemini to generate context-aware conversation starters, which appear directly on an LCD mounted to the glasses.',
          ],
          media: {
            kind: 'image',
            image: cupidTopDown,
            alt: 'Top-down view of the Cupid Glasses with camera, LCD and wiring mounted on the frame',
            caption: 'Top down view of Cupid Glasses',
          },
        },
        {
          heading: 'How it works',
          paragraphs: [
            'Cupid Glasses are built as a pipeline across a mobile app, a backend server, and wearable hardware. The Flutter app lets users create and manage profiles for people they know, storing each profile’s name, photo, and interests in Firebase so the backend can retrieve context instantly.',
            'When the glasses are running, an ESP32-CAM streams live video over a local Wi-Fi network to a Python backend. The backend processes incoming frames with OpenCV and uses the DeepFace recognition model to match the person in the live feed to one of the saved profile photos, then runs emotion inference with Presage to identify how that person is feeling. It queries Firebase for the matched person’s interests and sends the interests plus live emotion context to the Google Gemini API, which generates a personalized icebreaker sent back over the network and displayed on the glasses’ LCD.',
            'The project won 1st place in the Valentine’s Day theme and Best Use of the Gemini API at MakeUofT 2026.',
          ],
          media: {
            kind: 'image',
            image: cupidAwards,
            alt: 'Team members on stage at the MakeUofT award ceremony',
            caption: 'My team at the hackathon award ceremony',
          },
        },
      ],
    },
  },
  {
    slug: 'myoarm',
    name: 'MyoArm',
    description:
      'A robotic arm controlled entirely by human muscle flexion, sensed through an EMG electromyography sensor.',
    media: 'obj',
    modelUrl: '/models/myoarm.obj',
    href: '/projects/myoarm',
    detail: {
      timeframe: 'Mar – Apr 2026',
      techStack: ['Fusion 360', 'FPGA', 'Embedded C', 'Sensors'],
      sections: [
        {
          heading: 'What it does',
          paragraphs: [
            'MyoArm is a 5-degree-of-freedom robotic arm that translates human muscle flexion into real-time motion. An electromyography (EMG) sensor detects the tiny electrical signals produced by muscle activation, which the system reads and converts into arm movement.',
          ],
          media: { kind: 'video', videoId: 'RMHpapciQYU', videoTitle: 'MyoArm demo video' },
        },
        {
          heading: 'Design & build',
          paragraphs: [
            'I designed and 3D-modelled the full arm from scratch in Fusion 360, creating custom mechanical structures for joint rotation and gripper compression. The mechanical system was then fabricated and assembled by 3D printing every component, integrating servo motors, and wiring the power and signal lines.',
          ],
          media: {
            kind: 'image',
            image: myoarmFusion,
            alt: 'Fusion 360 screenshot of the robotic arm design',
            caption: 'Fusion 360 model of the arm',
          },
        },
        {
          heading: 'Control software',
          paragraphs: [
            'Embedded C software runs on a DE1-SoC’s Nios V soft processor to detect muscle flexes, switch between control modes, and generate pulse-width modulation (PWM) signals that drive five servos in real time.',
          ],
          media: {
            kind: 'image',
            image: myoarmPhoto,
            alt: 'The assembled MyoArm robotic arm',
            caption: 'The finished build',
          },
        },
      ],
    },
  },
  {
    slug: 'rfpoweramplifier',
    name: 'RF Power Amplifier',
    description:
      'A PCB designed for transmitting radio frequency signals — includes a Class-D power amplifier and 5-pole LC filter.',
    media: 'image',
    image: rfPcbTesting,
    href: '/projects/rfpoweramplifier',
    detail: {
      timeframe: 'Jan – Apr 2026',
      techStack: ['Altium Designer', 'LTspice', 'Python (test automation)'],
      sections: [
        {
          heading: 'The goal',
          paragraphs: [
            'This was a semester-long course project where our team built one subsystem of a larger software-defined radio — a modular high-frequency (HF) transceiver where many signal-processing tasks are handled in software, but real hardware still transmits and receives the signal.',
            'My subsystem was the RF power amplifier and filter, the final output stage of the transmitter: it increases the radio’s transmit signal to a usable power level and filters out unwanted frequency components before the signal reaches the antenna. I translated the team’s interface/specification document into a schematic, a PCB, and a test plan.',
          ],
          media: {
            kind: 'image',
            image: rfBreadboard,
            alt: 'Breadboard prototype of the amplifier connected to an oscilloscope showing a sine wave',
            caption: 'Early breadboard testing of design',
          },
        },
        {
          heading: 'Requirements',
          paragraphs: [
            'The subsystem was designed around a set of measurable requirements: operate across the project’s 8–16 MHz radio range and deliver 1–10 W of output power into a standard 50 Ω load representing the antenna.',
            'Signal quality mattered too — a switching amplifier can create unwanted harmonic content, so the design needed a filter to keep total harmonic distortion below 10%. The subsystem also needed transmit-enable control, turning the amplifier on only while the radio was transmitting.',
          ],
          media: {
            kind: 'image',
            image: rfImg,
            alt: 'Hand probing the amplifier PCB with an oscilloscope probe during testing',
            caption: 'PCB being tested against the requirements',
          },
        },
        {
          heading: 'Design and PCB implementation',
          paragraphs: [
            'I used LTspice to simulate and iterate on the schematic before moving into the physical PCB design in Altium. The transmit signal first enters a comparator that converts the incoming waveform into a clean switching signal, which drives a gate driver providing the fast, high-current switching the power transistor needs. The gate driver’s enable pin is tied to the inverted, active-low transmit-enable signal, so the amplifier only turns on while the radio is transmitting.',
            'From there the signal passes into the Class-D amplifier stage — the main power stage, using high-speed switching to raise the signal’s output power — and then through a 5-pole LC filter that preserves the transmit frequency while reducing the harmonics the switching stage produces.',
          ],
          media: {
            kind: 'image',
            image: rfLabelledPcb,
            alt: 'Annotated Altium screenshot of the PCB layout with labelled functional blocks',
            caption: 'Annotated screenshot of the Altium PCB',
          },
        },
        {
          heading: 'Results',
          paragraphs: [
            'I validated the assembled PCB with Python-based test automation, testing it against every subsystem requirement — output power, total harmonic distortion, and transmit-enable control — and it passed each one.',
            'The PCB was also selected for integration with the other subsystems to build the full software-defined radio, and that integration was successful, with the amplifier and filter operating as the radio’s final transmit-output stage.',
          ],
        },
      ],
    },
  },
  {
    slug: 'muxbox',
    name: 'MUXBOX',
    description:
      'A standalone drum pad built around an FPGA - includes 16 unique programmable sounds with loop recording and playback functionality.',
    media: 'image',
    image: muxboxImg,
    href: '/projects/muxbox',
    detail: {
      timeframe: 'Nov 2025',
      techStack: ['Verilog', 'Quartus Prime', 'ModelSim', 'Fusion 360', 'FPGA'],
      sections: [
        {
          heading: 'What it does',
          paragraphs: [
            'MUXBOX is a standalone FPGA drum pad and loop recorder: twelve sound pads trigger ROM-backed drum samples that are mixed in real time and sent to the on-board Audio CODEC. A 120 BPM metronome keeps time, a rotary encoder controls master volume (shown on the 7-segment/HEX display), and you can record up to 16 seconds of a pattern, save it, and play it back on loop.',
          ],
          media: {
            kind: 'image',
            image: muxboxWiring,
            alt: 'Hand-wired connections between the drum pads and the DE1-SoC board inside the enclosure',
            caption: 'Internal wiring of the board',
            imagePosition: 'center 80%',
          },
        },
        {
          heading: 'Hardware',
          paragraphs: [
            'We designed and built the entire physical system ourselves. I modeled the enclosure and the twelve soft pads in Fusion 360, 3D-printed the shell in PLA and the button caps in TPU, and hand-wired the sound pads and control buttons to the DE1-SoC via the GPIO header. The breadboard section routes pad/button signals, and the FPGA handles debouncing/edge-detection and audio generation/mixing before driving speakers through the board’s Audio CODEC.',
          ],
          media: {
            kind: 'image',
            image: muxboxEnclosure,
            alt: 'Fusion 360 model of the MUXBOX enclosure',
            caption: '3D model of the enclosure',
          },
        },
        {
          heading: 'FPGA design',
          paragraphs: [
            'My Verilog focused on the audio recording and playback engine, built around a finite-state machine. In the recording state, each pad press is logged as a timestamped event: a 30-bit clock cycle counter captures when the hit occurs, and a 12-bit button mask captures which of the 12 pads were hit. After 16 seconds, the design enters a waiting state so the user can keep or discard the recording. Pressing play enters the play state, where a counter replays the sequence by matching the running time against the saved timestamps and re-triggering the same pad sounds — producing a loop of the recorded beat.',
            'The design was synthesized with Intel Quartus Prime and verified with ModelSim testbenches.',
          ],
          media: {
            kind: 'image',
            image: muxboxModelsim,
            alt: 'ModelSim waveform simulation of the MUXBOX Verilog design',
            caption: 'A ModelSim simulation',
          },
        },
        {
          heading: 'Demo',
          media: { kind: 'video', videoId: 'wid7FjZui5c', videoTitle: 'MUXBOX demo video' },
        },
      ],
    },
  },
  {
    slug: 'seismolink',
    name: 'SeismoLink',
    description:
      'A solar-powered, community-deployable earthquake detection and alarm unit that flags seismic activity from satellite elevation data.',
    result: 'Winner at Hack Without Borders 2025.',
    media: 'image',
    image: seismoImg,
    href: '/projects/seismolink',
    detail: {
      timeframe: 'Mar 2025 — Hack Without Borders',
      techStack: ['Python', 'SketchUp'],
      recognition: ['Winner at Hack Without Borders 2025 (Engineers Without Borders)'],
      sections: [
        {
          heading: 'The problem',
          paragraphs: [
            'Haiti faces high seismic risk but has gaps in power, mobile coverage, and warning delivery, so critical alerts often don’t reach remote communities fast enough — contributing to higher casualties.',
          ],
          media: {
            kind: 'image',
            image: seismoEarthquake,
            alt: 'Aerial view of collapsed buildings after an earthquake in Haiti',
            caption: 'Earthquake damage in Haiti',
          },
        },
        {
          heading: 'What it does',
          paragraphs: [
            'SeismoLink is a community-deployable quake detection and alarm unit that triggers audible/visual alerts immediately. It’s designed to work even when grid power or cell service is unreliable, by running on solar power.',
          ],
          media: {
            kind: 'image',
            image: seismoAlarm,
            alt: '3D model showing the internal components of the alarm unit',
            caption: 'Alarm unit internals',
          },
        },
        {
          heading: 'How it works',
          paragraphs: [
            'SeismoLink uses a satellite modem to access GeoTIFF image files directly. These files are elevation maps, and by subtracting the elevation of two maps measured at different times, the system can evaluate ground displacement. A large displacement is an indicator of unusual seismic activity, so when it exceeds a threshold, an alarm is raised to notify community members.',
          ],
          media: {
            kind: 'image',
            image: seismoDisplacement,
            alt: 'Color-coded GeoTIFF ground-displacement map',
            caption: 'GeoTIFF displacement map',
          },
        },
      ],
    },
  },
];
