'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-violation-detection.ts';
import '@/ai/flows/predict-traffic-conditions.ts';
import '@/ai/flows/generate-daily-report.ts';
