import { programImages } from "@/lib/sharedAssets";
import { LibraryProgram } from "./types";

export const programsData: LibraryProgram[] = [
  {
    id: 'breathing-basics',
    title: 'Breathing Basics: Master Your Foundation',
    description: 'Build a strong foundation in breathing techniques and discover the power of conscious breath.',
    image: programImages.breathingBasics,
    classCount: 5,
    locked: false,
    sessions: [
      { id: '1', title: 'Introduction to Breathwork', teacher: 'March Russell', duration: 10, image: programImages.breathingBasics, locked: false },
      { id: '2', title: 'Diaphragmatic Breathing', teacher: 'March Russell', duration: 12, image: programImages.breathingBasics, locked: false },
      { id: '3', title: 'Box Breathing Technique', teacher: 'March Russell', duration: 15, image: programImages.breathingBasics, locked: false },
      { id: '4', title: 'Alternate Nostril Breathing', teacher: 'March Russell', duration: 10, image: programImages.breathingBasics, locked: false },
      { id: '5', title: 'Coherent Breathing Practice', teacher: 'March Russell', duration: 18, image: programImages.breathingBasics, locked: false },
    ]
  },
  {
    id: 'nervous-system',
    title: 'Change Starts With Your Nervous System',
    description: 'Transform your relationship with stress through breathwork and nervous system regulation.',
    image: programImages.trial,
    classCount: 7,
    locked: true,
    sessions: [
      { id: '1', title: 'Understanding Your Nervous System', teacher: 'March Russell', duration: 12, image: programImages.trial, locked: true },
      { id: '2', title: 'Vagal Tone Activation', teacher: 'March Russell', duration: 15, image: programImages.trial, locked: true },
      { id: '3', title: 'Stress Response Reset', teacher: 'March Russell', duration: 10, image: programImages.trial, locked: true },
      { id: '4', title: 'Nervous System Regulation', teacher: 'March Russell', duration: 20, image: programImages.trial, locked: true },
      { id: '5', title: 'Building Resilience', teacher: 'March Russell', duration: 18, image: programImages.trial, locked: true },
      { id: '6', title: 'Integration Practice', teacher: 'March Russell', duration: 15, image: programImages.trial, locked: true },
      { id: '7', title: 'Daily Regulation Routine', teacher: 'March Russell', duration: 12, image: programImages.trial, locked: true },
    ]
  },
  {
    id: 'finding-aliveness',
    title: 'Finding Your Aliveness',
    description: 'Access breakthrough states and reconnect with your vitality through expansive breathwork practices.',
    image: programImages.findingAliveness,
    classCount: 3,
    locked: true,
    sessions: [
      { id: '1', title: 'Awakening Vitality', teacher: 'March Russell', duration: 20, image: programImages.findingAliveness, locked: true },
      { id: '2', title: 'Expansive Breathwork', teacher: 'March Russell', duration: 25, image: programImages.findingAliveness, locked: true },
      { id: '3', title: 'Living Fully Alive', teacher: 'March Russell', duration: 30, image: programImages.findingAliveness, locked: true },
    ]
  }
];
